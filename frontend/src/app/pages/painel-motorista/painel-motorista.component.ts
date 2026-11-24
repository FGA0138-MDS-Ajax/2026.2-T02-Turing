
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DestinoService } from '../../services/destino.service';
import { RotaService } from '../../services/rota.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { MapaRotaComponent } from '../../shared/mapa-rota/mapa-rota.component';
import { mensagemDeErro } from '../../shared/erro.util';

import {
  Destino,
  DestinoCreateRequest,
  StatusValidacao
} from '../../models/destino.model';

import {
  RotaCreateRequest,
  RotaCreateResponse
} from '../../models/rota.model';


function formularioVazio(): DestinoCreateRequest {
  return {
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: 'Brasília',
    estado: 'DF',
    cep: '',
    janela_inicio: '',
    janela_fim: ''
  };
}


function dataLocalHoje(): string {
  const hoje = new Date();

  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const dia = String(hoje.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
}


@Component({
  selector: 'app-painel-motorista',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    MapaRotaComponent
  ],
  templateUrl: './painel-motorista.component.html',
  styleUrls: [
    '../../shared/painel-base.css',
    './painel-motorista.component.css'
  ]
})
export class PainelMotoristaComponent implements OnInit {

  readonly abas = [
    { id: 'entregas', rotulo: 'Planejar rota' }
  ];

  abaAtiva = 'entregas';

  // Endereços cadastrados pelo motorista.
  enderecos: Destino[] = [];
  carregandoEnderecos = false;
  erroEnderecos = '';
  mensagemSucesso = '';

  // Formulário de cadastro e edição.
  exibirFormulario = false;
  salvandoEndereco = false;
  enderecoEmEdicaoId: number | null = null;
  formEndereco: DestinoCreateRequest = formularioVazio();
  erroFormulario = '';

  // Apenas os IDs das entregas.
  selecionados = new Set<number>();

  // A origem é independente das entregas.
  pontoPartidaId: number | null = null;

  // Configurações da rota.
  dataExecucao = dataLocalHoje();
  horaSaida = '12:00';
  nomeRota = '';

  // Resultado do cálculo.
  calculando = false;
  erroRota = '';
  resultado: RotaCreateResponse | null = null;

  @ViewChild('blocoResultado')
  private blocoResultado?: ElementRef<HTMLElement>;

  constructor(
    private destinoService: DestinoService,
    private rotaService: RotaService
  ) {}

  ngOnInit(): void {
    this.carregarEnderecos();
  }

  // -----------------------------------------------
  // Listagem de endereços
  // -----------------------------------------------

  carregarEnderecos(): void {
    this.carregandoEnderecos = true;
    this.erroEnderecos = '';

    this.destinoService.listarDestinos().subscribe({
      next: (dados) => {
        this.enderecos = dados;
        this.carregandoEnderecos = false;

        // Verifica se a origem escolhida ainda existe
        // e possui coordenadas validadas.
        this.ajustarPontoPartida();

        // Mantém somente entregas válidas, diferentes da origem.
        this.selecionados = new Set(
          [...this.selecionados].filter(id =>
            id !== this.pontoPartidaId &&
            dados.some(endereco =>
              endereco.id === id &&
              this.podeSelecionarEntrega(endereco)
            )
          )
        );
      },
      error: (erro) => {
        this.carregandoEnderecos = false;

        this.erroEnderecos = mensagemDeErro(
          erro,
          'Não foi possível carregar seus endereços.'
        );
      }
    });
  }

  formatarEndereco(endereco: Destino): string {
    const complemento = endereco.complemento
      ? `, ${endereco.complemento}`
      : '';

    return (
      `${endereco.logradouro}, ${endereco.numero}` +
      `${complemento} - ${endereco.cidade}/${endereco.estado}`
    );
  }

  // -----------------------------------------------
  // Cadastro e edição de endereços
  // -----------------------------------------------

  abrirCadastro(): void {
    this.enderecoEmEdicaoId = null;
    this.formEndereco = formularioVazio();
    this.erroFormulario = '';
    this.mensagemSucesso = '';
    this.exibirFormulario = true;
  }

  editarEndereco(endereco: Destino): void {
    this.enderecoEmEdicaoId = endereco.id;

    this.formEndereco = {
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      complemento: endereco.complemento || '',
      bairro: endereco.bairro || '',
      cidade: endereco.cidade,
      estado: endereco.estado,
      cep: endereco.cep,
      janela_inicio: endereco.janela_inicio?.slice(0, 5) || '',
      janela_fim: endereco.janela_fim?.slice(0, 5) || ''
    };

    this.erroFormulario = '';
    this.mensagemSucesso = '';
    this.exibirFormulario = true;
  }

  cancelarFormulario(): void {
    this.exibirFormulario = false;
    this.enderecoEmEdicaoId = null;
    this.formEndereco = formularioVazio();
    this.erroFormulario = '';
  }

  salvarEndereco(): void {
    if (this.salvandoEndereco) {
      return;
    }

    this.erroFormulario = '';
    this.mensagemSucesso = '';

    const inicioJanela =
      this.formEndereco.janela_inicio?.trim() || null;

    const fimJanela =
      this.formEndereco.janela_fim?.trim() || null;

    const dados: DestinoCreateRequest = {
      ...this.formEndereco,

      janela_inicio: inicioJanela,
      janela_fim: fimJanela,

      logradouro: this.formEndereco.logradouro.trim(),
      numero: this.formEndereco.numero.trim(),
      complemento: this.formEndereco.complemento?.trim(),
      bairro: this.formEndereco.bairro?.trim(),
      cidade: this.formEndereco.cidade.trim(),
      estado: this.formEndereco.estado.trim().toUpperCase(),
      cep: this.formEndereco.cep.replace(/\D/g, '')
    };

    if (
      !dados.logradouro ||
      !dados.numero ||
      !dados.cidade ||
      !dados.estado ||
      !dados.cep
    ) {
      this.erroFormulario =
        'Preencha os campos obrigatórios.';
      return;
    }

    if (dados.estado.length !== 2) {
      this.erroFormulario =
        'Informe a UF com duas letras.';
      return;
    }

    if (!/^\d{8}$/.test(dados.cep)) {
      this.erroFormulario =
        'Informe um CEP com oito dígitos.';
      return;
    }

    // A origem pode ficar sem janela.
    // Entretanto, uma janela parcial não é válida.
    if (Boolean(inicioJanela) !== Boolean(fimJanela)) {
      this.erroFormulario =
        'Informe os dois horários da janela ou deixe ambos vazios.';
      return;
    }

    if (
      inicioJanela &&
      fimJanela &&
      fimJanela < inicioJanela
    ) {
      this.erroFormulario =
        'O fim da janela não pode ser anterior ao início.';
      return;
    }

    this.salvandoEndereco = true;

    const editando = this.enderecoEmEdicaoId !== null;

    const requisicao = editando
      ? this.destinoService.atualizarDestino(
          this.enderecoEmEdicaoId!,
          dados
        )
      : this.destinoService.cadastrarDestino(dados);

    requisicao.subscribe({
      next: () => {
        this.salvandoEndereco = false;
        this.cancelarFormulario();

        this.mensagemSucesso = editando
          ? 'Endereço atualizado com sucesso.'
          : 'Endereço cadastrado com sucesso.';

        this.resultado = null;
        this.carregarEnderecos();
      },
      error: (erro) => {
        this.salvandoEndereco = false;

        this.erroFormulario = mensagemDeErro(
          erro,
          'Não foi possível salvar o endereço.'
        );
      }
    });
  }

  excluirEndereco(endereco: Destino): void {
    const confirmou = window.confirm(
      `Deseja excluir o endereço ${this.formatarEndereco(endereco)}?`
    );

    if (!confirmou) {
      return;
    }

    this.destinoService.deletarDestino(endereco.id).subscribe({
      next: () => {
        this.selecionados.delete(endereco.id);

        if (this.pontoPartidaId === endereco.id) {
          this.pontoPartidaId = null;
        }

        this.resultado = null;
        this.mensagemSucesso = 'Endereço excluído com sucesso.';
        this.carregarEnderecos();
      },
      error: (erro) => {
        this.erroEnderecos = mensagemDeErro(
          erro,
          'Não foi possível excluir o endereço.'
        );
      }
    });
  }

  // -----------------------------------------------
  // Origem e seleção das entregas
  // -----------------------------------------------

  // A origem precisa estar geocodificada.
  // Não precisa possuir janela de entrega.
  podeSerOrigem(endereco: Destino): boolean {
    return (
      endereco.validacao_status === StatusValidacao.VALIDADO &&
      endereco.latitude != null &&
      endereco.longitude != null
    );
  }

  // Toda entrega precisa ter uma janela completa.
  podeSelecionarEntrega(endereco: Destino): boolean {
    return (
      this.podeSerOrigem(endereco) &&
      !!endereco.janela_inicio &&
      !!endereco.janela_fim &&
      endereco.janela_inicio <= endereco.janela_fim &&
      endereco.id !== this.pontoPartidaId
    );
  }

  // Mantém compatibilidade com o HTML atual.
  podeSelecionar(endereco: Destino): boolean {
    return this.podeSelecionarEntrega(endereco);
  }

  // Endereços disponíveis para saída e retorno.
  get enderecosDisponiveisOrigem(): Destino[] {
    return this.enderecos.filter(endereco =>
      this.podeSerOrigem(endereco)
    );
  }

  // Somente as entregas selecionadas.
  get enderecosSelecionados(): Destino[] {
    return this.enderecos.filter(endereco =>
      this.selecionados.has(endereco.id) &&
      this.podeSelecionarEntrega(endereco)
    );
  }

  get todosSelecionados(): boolean {
    const disponiveis = this.enderecos.filter(endereco =>
      this.podeSelecionarEntrega(endereco)
    );

    return (
      disponiveis.length > 0 &&
      disponiveis.every(endereco =>
        this.selecionados.has(endereco.id)
      )
    );
  }

  alternarSelecao(endereco: Destino): void {
    if (!this.podeSelecionarEntrega(endereco)) {
      return;
    }

    if (this.selecionados.has(endereco.id)) {
      this.selecionados.delete(endereco.id);
    } else {
      this.selecionados.add(endereco.id);
    }

    this.resultado = null;
  }

  alternarTodos(): void {
    if (this.todosSelecionados) {
      this.selecionados.clear();
    } else {
      this.enderecos
        .filter(endereco => this.podeSelecionarEntrega(endereco))
        .forEach(endereco =>
          this.selecionados.add(endereco.id)
        );
    }

    this.resultado = null;
  }

  // Executado ao escolher uma origem no formulário.
  aoAlterarPontoPartida(): void {
    if (this.pontoPartidaId !== null) {
      this.selecionados.delete(this.pontoPartidaId);
    }

    this.ajustarPontoPartida();

    this.erroRota = '';
    this.resultado = null;
  }

  private ajustarPontoPartida(): void {
    const origem = this.enderecos.find(endereco =>
      endereco.id === this.pontoPartidaId
    );

    if (!origem || !this.podeSerOrigem(origem)) {
      this.pontoPartidaId = null;
    }

    if (this.pontoPartidaId !== null) {
      this.selecionados.delete(this.pontoPartidaId);
    }
  }

  // -----------------------------------------------
  // Cálculo da rota
  // -----------------------------------------------

  calcularRota(): void {
    if (this.calculando) {
      return;
    }

    this.erroRota = '';

    const origem = this.enderecos.find(endereco =>
      endereco.id === this.pontoPartidaId &&
      this.podeSerOrigem(endereco)
    );

    if (!origem) {
      this.erroRota =
        'Selecione um ponto de partida válido.';
      return;
    }

    const entregas = this.enderecosSelecionados;

    if (entregas.length < 1) {
      this.erroRota =
        'Selecione pelo menos uma entrega validada com janela de horário.';
      return;
    }

    if (entregas.some(entrega => entrega.id === origem.id)) {
      this.erroRota =
        'O ponto de partida não pode ser também uma entrega.';
      return;
    }

    if (!this.dataExecucao || !this.horaSaida) {
      this.erroRota =
        'Informe a data e o horário de saída.';
      return;
    }

    // A origem é enviada separadamente das entregas.
    const dados: RotaCreateRequest = {
      id_origem: origem.id,
      ids_enderecos: entregas.map(entrega => entrega.id),
      data_execucao: this.dataExecucao,
      hora_saida: this.horaSaida,
      nome: this.nomeRota.trim() || undefined
    };

    this.calculando = true;
    this.resultado = null;

    this.rotaService.calcularRota(dados).subscribe({
      next: (resposta) => {
        this.resultado = resposta;
        this.calculando = false;

        setTimeout(() => {
          this.blocoResultado?.nativeElement.scrollIntoView({
            block: 'start',
            behavior: 'smooth'
          });
        });
      },
      error: (erro) => {
        this.calculando = false;

        this.erroRota = mensagemDeErro(
          erro,
          'Não foi possível calcular a rota.'
        );
      }
    });
  }

  formatarKm(km: number): string {
    return (
      km.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + ' km'
    );
  }

  formatarDuracao(minutos: number): string {
    if (minutos > 0 && minutos < 1) {
      return 'Menos de 1 min';
    }

    const total = Math.round(minutos);
    const horas = Math.floor(total / 60);
    const resto = total % 60;

    return horas > 0
      ? `${horas} h ${String(resto).padStart(2, '0')} min`
      : `${resto} min`;
  }
}