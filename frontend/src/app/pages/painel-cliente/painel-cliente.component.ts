import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-painel-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './painel-cliente.component.html',
  styleUrl: './painel-cliente.component.css'
})
export class PainelClienteComponent {
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
  novoPedido = {
    descricao: '',
    cep: '',
    numero: null
  };
 
  // lista mockada de pedidos p/ testar a tabela
  listaPedidos = [
    { id: 101, descricao: 'Pacote de Livros', cep: '70833-010', numero: 20, status: 'Em trânsito' },
    { id: 102, descricao: 'Documentos Assinados', cep: '70355-510', numero: 15, status: 'Aguardando Coleta' }
  ];

  // guarda o pedido clicado p/ mostrar na tela de det
  pedidoSelecionado: any = null;

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
    const pedidoParaApi = {
      descricao: this.novoPedido.descricao,
      endereco: {
        cep: this.novoPedido.cep,
        numero: Number(this.novoPedido.numero),
        latitude: -15.7942, // lat padrão p/ o back n recusar
        longitude: -47.8822 // long padrão p/ o back n recusar
      }
    };

    console.log('enviando p/ api:', pedidoParaApi);

    // add o novo pedido na lista visual
    this.listaPedidos.push({
      id: Math.floor(Math.random() * 900) + 100,
      descricao: this.novoPedido.descricao,
      cep: this.novoPedido.cep,
      numero: Number(this.novoPedido.numero),
      status: 'Aguardando Coleta'
    });
    
    // limpa o form e volta p/ aba de listagem
    this.novoPedido = { descricao: '', cep: '', numero: null };
    this.selecionarAba('ver-pedidos');
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