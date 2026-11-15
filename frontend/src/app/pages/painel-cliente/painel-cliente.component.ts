import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RotaService } from '../../services/rota.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { mensagemDeErro } from '../../shared/erro.util';
import {
  NovoPedido,
  Pedido,
  ROTULOS_STATUS,
  classeStatus,
  rotuloStatus,
  textoEndereco,
  textoJanela
} from '../../models/pedido.model';

type Aba = 'fazer-pedido' | 'ver-pedidos' | 'detalhes-pedido';

interface Mensagem {
  tipo: 'erro' | 'sucesso';
  texto: string;
}

// campos do formulário de novo pedido
interface FormPedido {
  descricao: string;
  cep: string;
  numero: string;
  dataEntrega: string;
  janelaInicio: string;
  janelaFim: string;
}

type ErrosForm = Partial<Record<keyof FormPedido, string>>;

// data de hoje no fuso do usuário, no formato yyyy-mm-dd (nsei fazer o contrario)
function dataLocalISO(): string {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

@Component({
  selector: 'app-painel-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './painel-cliente.component.html',
  styleUrls: ['../../shared/painel-base.css', './painel-cliente.component.css']
})
export class PainelClienteComponent implements OnInit {
  // abas da navbar
  readonly abas = [
    { id: 'fazer-pedido', rotulo: 'Fazer pedido' },
    { id: 'ver-pedidos', rotulo: 'Meus pedidos' }
  ];

  // opções do filtro de status
  readonly opcoesStatus = Object.entries(ROTULOS_STATUS).map(([valor, rotulo]) => ({
    valor,
    rotulo
  }));

  // helpers usados direto no html
  readonly rotulo = rotuloStatus;
  readonly classe = classeStatus;
  readonly textoEndereco = textoEndereco;
  readonly textoJanela = textoJanela;

  readonly hoje = dataLocalISO();

  abaAtiva: Aba = 'ver-pedidos';

  // lista de pedidos vinda do back
  listaPedidos: Pedido[] = [];
  carregando = false;
  erroLista = '';

  // pedido aberto na tela de detalhes
  pedidoSelecionado: Pedido | null = null;

  // filtros da lista
  filtroTexto = '';
  filtroStatus = '';

  // formulário de novo pedido
  form: FormPedido = this.formVazio();
  errosForm: ErrosForm = {};
  tentouEnviar = false;
  enviando = false;

  // aviso exibido no topo da página (sucesso ou erro de envio)
  mensagem: Mensagem | null = null;

  constructor(private rotaService: RotaService) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  // na navbar, os detalhes contam como parte de "Meus pedidos"
  get abaDestaque(): string {
    return this.abaAtiva === 'detalhes-pedido' ? 'ver-pedidos' : this.abaAtiva;
  }

  // lista com os filtros de texto e status aplicados
  get pedidosFiltrados(): Pedido[] {
    const termo = this.filtroTexto.trim().toLowerCase();

    return this.listaPedidos.filter((pedido) => {
      if (this.filtroStatus && pedido.status !== this.filtroStatus) {
        return false;
      }
      if (!termo) {
        return true;
      }
      return [String(pedido.id), pedido.descricao ?? '', pedido.cep ?? ''].some((texto) =>
        texto.toLowerCase().includes(termo)
      );
    });
  }

  trackPorId(_indice: number, pedido: Pedido): number {
    return pedido.id;
  }

  // busca os pedidos no back
  carregarPedidos(): void {
    this.carregando = true;
    this.erroLista = '';

    this.rotaService.obterPedidos().subscribe({
      next: (pedidos) => {
        this.listaPedidos = pedidos;
        this.carregando = false;
      },
      error: (erro) => {
        this.carregando = false;
        this.erroLista = mensagemDeErro(erro, 'Não foi possível carregar os pedidos.');
      }
    });
  }

  // troca de aba (vem da navbar ou dos botões da tela)
  selecionarAba(aba: string): void {
    this.abaAtiva = aba as Aba;
    this.mensagem = null;
  }

  verDetalhes(pedido: Pedido): void {
    this.pedidoSelecionado = pedido;
    this.selecionarAba('detalhes-pedido');
  }

  // o cep é digitado só com números e ganha o hífen sozinho (72115000 -> 72115-000)
  aoDigitarCep(valor: string): void {
    const digitos = (valor ?? '').replace(/\D/g, '').slice(0, 8);
    this.form.cep = digitos.length > 5 ? `${digitos.slice(0, 5)}-${digitos.slice(5)}` : digitos;
    this.revalidar();
  }

  // depois da primeira tentativa de envio, os erros somem conforme o usuário corrige
  revalidar(): void {
    if (this.tentouEnviar) {
      this.validar();
    }
  }

  // valida o formulário e guarda a mensagem de cada campo com problema
  private validar(): boolean {
    const f = this.form;
    const erros: ErrosForm = {};

    if (!f.descricao.trim()) {
      erros.descricao = 'Descreva o que será entregue.';
    }
    if (!/^\d{5}-\d{3}$/.test(f.cep)) {
      erros.cep = 'Informe o CEP com 8 dígitos, por exemplo 72115-000.';
    }
    if (!f.numero.trim()) {
      erros.numero = 'Informe o número ou o lote.';
    }
    if (!f.dataEntrega) {
      erros.dataEntrega = 'Escolha a data de entrega.';
    } else if (f.dataEntrega < this.hoje) {
      erros.dataEntrega = 'A data de entrega não pode estar no passado.';
    }
    if (f.janelaInicio && f.janelaFim && f.janelaFim < f.janelaInicio) {
      erros.janelaFim = 'O horário final deve ser depois do inicial.';
    }

    this.errosForm = erros;
    return Object.keys(erros).length === 0;
  }

  // valida e envia o pedido para a api (o back descobre as coordenadas)
  enviarPedido(): void {
    this.tentouEnviar = true;
    this.mensagem = null;

    if (!this.validar() || this.enviando) {
      return;
    }

    const pedido: NovoPedido = {
      descricao: this.form.descricao.trim(),
      cep: this.form.cep,
      numero: this.form.numero.trim(),
      data_entrega: this.form.dataEntrega
    };
    if (this.form.janelaInicio) {
      pedido.janela_entrega_inicio = this.form.janelaInicio;
    }
    if (this.form.janelaFim) {
      pedido.janela_entrega_fim = this.form.janelaFim;
    }

    this.enviando = true;
    this.rotaService.criarPedido(pedido).subscribe({
      next: () => {
        this.enviando = false;
        this.form = this.formVazio();
        this.errosForm = {};
        this.tentouEnviar = false;
        this.carregarPedidos();
        this.abaAtiva = 'ver-pedidos';
        this.mensagem = {
          tipo: 'sucesso',
          texto: 'Pedido solicitado. Ele aparece na lista com o status Pendente.'
        };
      },
      error: (erro) => {
        this.enviando = false;
        this.mensagem = {
          tipo: 'erro',
          texto: mensagemDeErro(
            erro,
            'Não foi possível enviar o pedido. Confira os dados e tente de novo.'
          )
        };
      }
    });
  }

  private formVazio(): FormPedido {
    return {
      descricao: '',
      cep: '',
      numero: '',
      dataEntrega: '',
      janelaInicio: '',
      janelaFim: ''
    };
  }
}