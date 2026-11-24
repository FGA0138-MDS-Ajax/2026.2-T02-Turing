
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

  // Mantemos o ID antigo para nao quebrar o HTML atual.
  readonly abas = [
    { id: 'entregas', rotulo: 'Planejar rota' }
  ];

  abaAtiva = 'entregas';

  // Enderecos cadastrados pelo motorista.
  enderecos: Destino[] = [];
  carregandoEnderecos = false;
  erroEnderecos = '';
  mensagemSucesso = '';

  // Formulario de cadastro e edicao.
  exibirFormulario = false;
  salvandoEndereco = false;
  enderecoEmEdicaoId: number | null = null;
  formEndereco: DestinoCreateRequest = formularioVazio();
  erroFormulario = '';

  // Enderecos selecionados para a rota.
  selecionados = new Set<number>();
  pontoPartidaId: number | null = null;

  // Configuracoes da rota.
  dataExecucao = dataLocalHoje();
  horaSaida = '12:00';
  nomeRota = '';

  // Resultado do calculo.
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
  // Listagem de enderecos
  // -----------------------------------------------

  carregarEnderecos(): void {
    this.carregandoEnderecos = true;
    this.erroEnderecos = '';

    this.destinoService.listarDestinos().subscribe({
      next: (dados) => {
        this.enderecos = dados;
        this.carregandoEnderecos = false;

        // Remove da selecao enderecos que deixaram
        // de existir ou que nao estao validados.
        this.selecionados = new Set(
          [...this.selecionados].filter(id =>
            dados.some(
              endereco =>
                endereco.id === id &&
                this.podeSelecionar(endereco)
            )
          )
        );

        this.ajustarPontoPartida();
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
  // Cadastro e edicao de enderecos
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

    const dados: DestinoCreateRequest = {
      ...this.formEndereco,
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
      this.erroFormulario = 'Preencha os campos obrigatórios.';
      return;
    }

    if (dados.estado.length !== 2) {
      this.erroFormulario = 'Informe a UF com duas letras.';
      return;
    }

    if (!/^\d{8}$/.test(dados.cep)) {
      this.erroFormulario = 'Informe um CEP com oito dígitos.';
      return;
    }

    if (!dados.janela_inicio || !dados.janela_fim) {
      this.erroFormulario =
        'Informe o início e o fim da janela de horário.';
      return;
    }

    if (dados.janela_fim < dados.janela_inicio) {
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
        this.ajustarPontoPartida();
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
  // Selecao de paradas
  // -----------------------------------------------

  podeSelecionar(endereco: Destino): boolean {
    return (
      endereco.validacao_status === StatusValidacao.VALIDADO &&
      endereco.latitude != null &&
      endereco.longitude != null
    );
  }

  get enderecosSelecionados(): Destino[] {
    return this.enderecos.filter(
      endereco => this.selecionados.has(endereco.id)
    );
  }

  get todosSelecionados(): boolean {
    const disponiveis = this.enderecos.filter(
      endereco => this.podeSelecionar(endereco)
    );

    return (
      disponiveis.length > 0 &&
      disponiveis.every(
        endereco => this.selecionados.has(endereco.id)
      )
    );
  }

  alternarSelecao(endereco: Destino): void {
    if (!this.podeSelecionar(endereco)) {
      return;
    }

    if (this.selecionados.has(endereco.id)) {
      this.selecionados.delete(endereco.id);
    } else {
      this.selecionados.add(endereco.id);
    }

    this.ajustarPontoPartida();
  }

  alternarTodos(): void {
    if (this.todosSelecionados) {
      this.selecionados.clear();
    } else {
      this.enderecos
        .filter(endereco => this.podeSelecionar(endereco))
        .forEach(endereco =>
          this.selecionados.add(endereco.id)
        );
    }

    this.ajustarPontoPartida();
  }

  private ajustarPontoPartida(): void {
    const selecionados = this.enderecosSelecionados;

    if (
      !selecionados.some(
        endereco => endereco.id === this.pontoPartidaId
      )
    ) {
      this.pontoPartidaId = selecionados[0]?.id ?? null;
    }
  }

  // -----------------------------------------------
  // Calculo da rota
  // -----------------------------------------------

  calcularRota(): void {
    const enderecos = this.enderecosSelecionados;

    if (this.calculando) {
      return;
    }

    if (enderecos.length < 2) {
      this.erroRota =
        'Selecione pelo menos dois endereços validados.';
      return;
    }

    if (!this.dataExecucao || !this.horaSaida) {
      this.erroRota =
        'Informe a data e o horário de saída.';
      return;
    }

    const partida = enderecos.find(
      endereco => endereco.id === this.pontoPartidaId
    ) ?? enderecos[0];

    // O primeiro endereco enviado ao backend
    // e o ponto inicial e final da rota.
    const ordenados = [
      partida,
      ...enderecos.filter(
        endereco => endereco.id !== partida.id
      )
    ];

    const dados: RotaCreateRequest = {
      ids_enderecos: ordenados.map(endereco => endereco.id),
      data_execucao: this.dataExecucao,
      hora_saida: this.horaSaida,
      nome: this.nomeRota.trim() || undefined
    };

    this.calculando = true;
    this.erroRota = '';
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