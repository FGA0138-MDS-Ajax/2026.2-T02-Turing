import { Component, OnInit } from '@angular/core'; // add OnInit p/ carregar os pedidos ao abrir a tela
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RotaService } from '../../services/rota.service'; // service q fala c/ o back

@Component({
  selector: 'app-painel-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './painel-cliente.component.html',
  styleUrl: './painel-cliente.component.css'
})
export class PainelClienteComponent implements OnInit {
  // define qual aba ta ativa na tela
  abaAtiva: string = 'ver-pedidos';
  // controla se o menu do perfil tá aberto ou fechado
  menuPerfilAberto: boolean = false;
  // controla se o dropdown de notificacoes tá aberto ou fechado
  notificacoesAberto: boolean = false;

  // filtro atual das notifs ('todas' ou 'nao-lidas')
  filtroNotificacoes: string = 'todas';

  // lista de notificacoes c/ status de leitura
  listaNotificacoes = [
    { id: 1, titulo: 'Pedido #101 saiu para entrega', tempo: 'Há 15 minutos', lida: false },
    { id: 2, titulo: 'Pedido #102 confirmado com sucesso', tempo: 'Há 2 horas', lida: false }
  ];

  // obj do form p/ recolher cep e num sep
  // numero agora é texto p/ aceitar casos como "12-B" (no banco é varchar)
  novoPedido = {
    descricao: '',
    cep: '',
    numero: ''
  };
 
  // lista de pedidos vinda do back (antes era mockada)
  listaPedidos: any[] = [];

  // guarda o pedido clicado p/ mostrar na tela de det
  pedidoSelecionado: any = null;

  // trava o botao de enviar enquanto o back responde, p/ n clicar 2x
  enviando: boolean = false;

  // traduz o status do banco p/ um texto amigavel na tela
  private rotulosStatus: { [chave: string]: string } = {
    PENDENTE: 'Pendente',
    PLANEJADO: 'Planejado',
    SAIU_PARA_ENTREGA: 'Saiu para entrega',
    EM_ANDAMENTO: 'Em andamento',
    ENTREGUE: 'Entregue',
    FALHOU: 'Falhou',
    CANCELADO: 'Cancelado'
  };

  // injeta o service p/ poder chamar a api
  constructor(private rotaService: RotaService) {}

  // roda ao abrir a tela e já busca os pedidos
  ngOnInit(): void {
    this.carregarPedidos();
  }

  // devolve o texto amigavel do status (usar no html no lugar de pedido.status)
  rotuloStatus(status: string): string {
    return this.rotulosStatus[status] || status;
  }

  // carregar pedidos: busca os pedidos do cliente no back
  carregarPedidos() {
    this.rotaService.obterPedidos().subscribe({
      next: (pedidos) => (this.listaPedidos = pedidos),
      error: (erro) => console.error('erro ao buscar pedidos:', erro)
    });
  }

  // retorna apenas a quant de notifs nao lidas p/ o badge
  get qtdNaoLidas(): number {
    return this.listaNotificacoes.filter(n => !n.lida).length;
  }

  // retorna a lista filtrada conforme a aba selecionada no dropdown
  get notificacoesFiltradas() {
    if (this.filtroNotificacoes === 'nao-lidas') {
      return this.listaNotificacoes.filter(n => !n.lida);
    }
    return this.listaNotificacoes;
  }

  // altera o filtro do dropdown de notifs
  mudarFiltroNotificacoes(filtro: string) {
    this.filtroNotificacoes = filtro;
  }

  // marca todas as notifs como lidas
  marcarTodasComoLidas() {
    this.listaNotificacoes.forEach(n => n.lida = true);
  }

  // muda a aba atual e fecha todos os menus abertos
  selecionarAba(aba: string) {
    this.abaAtiva = aba;
    this.menuPerfilAberto = false;
    this.notificacoesAberto = false;
  }

  // abre ou fecha o dropdown do perfil
  toggleMenuPerfil() {
    this.menuPerfilAberto = !this.menuPerfilAberto;
    this.notificacoesAberto = false;
  }

  // abre ou fecha o menu de notificacoes
  toggleNotificacoes() {
    this.notificacoesAberto = !this.notificacoesAberto;
    this.menuPerfilAberto = false;
  }

  // formata os dados e envia o pedido p/ api
  enviarPedido() {
    // valida se os campos estao preenchidos antes de enviar
    if (!this.novoPedido.descricao || !this.novoPedido.cep || !this.novoPedido.numero) {
      alert('preencha descrição, cep e número.');
      return;
    }

    // manda só descricao, cep e numero (o back descobre as coordenadas)
    const pedido = {
      descricao: this.novoPedido.descricao,
      cep: this.novoPedido.cep,
      numero: String(this.novoPedido.numero)
    };

    this.enviando = true;
    this.rotaService.criarPedido(pedido).subscribe({
      next: () => {
        this.enviando = false;
        // limpa o form, recarrega a lista do back e volta p/ aba de listagem
        this.novoPedido = { descricao: '', cep: '', numero: '' };
        this.carregarPedidos();
        this.selecionarAba('ver-pedidos');
      },
      error: (erro) => {
        this.enviando = false;
        // mostra o motivo q o back mandou (ex: endereço n encontrado)
        alert(erro.error?.detail || 'erro ao enviar o pedido.');
      }
    });
  }

  // pega o pedido clicado e abre a tela de det
  verDetalhesPedido(pedido: any) {
    this.pedidoSelecionado = pedido;
    this.abaAtiva = 'detalhes-pedido';
  }

  // simula a abertura do mapa de rastreio
  rastrearPedido(pedido: any) {
    alert(`abrindo rastreio p/ o pedido #${pedido.id}`);
  }

  // cancela o pedido selecionado removendo-o da lista
  // (ainda só local: o back n tem endpoint de cancelamento)
  cancelarPedido(pedido: any) {
    if (confirm(`Certeza que deseja cancelar o pedido #${pedido.id}?`)) {
      this.listaPedidos = this.listaPedidos.filter(p => p.id !== pedido.id);
      alert('Pedido cancelado com sucesso.');
      this.selecionarAba('ver-pedidos');
    }
  }

  // abre as configs da conta
  abrirConfiguracoes() {
    alert('abrindo configs...');
    this.menuPerfilAberto = false;
  }

  // faz o logout da conta
  sair() {
    alert('saindo da conta...');
    this.menuPerfilAberto = false;
  }
}