import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RotaService } from '../../services/rota.service';

@Component({
  selector: 'app-painel-motorista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './painel-motorista.component.html',
  styleUrls: ['./painel-motorista.component.css']
})
export class PainelMotoristaComponent implements OnInit {
  abaAtiva: string = 'entregas';
  menuPerfilAberto: boolean = false;

  // lista de entregas vindas do backend
  listaEntregas: any[] = [];
  
  // armazena os IDs dos pedidos selecionados pelas checkboxes
  pedidosSelecionados: number[] = [];

  constructor(private rotaService: RotaService) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  // carregar pedidos: busca os dados do banco via api
  carregarPedidos() {
    this.rotaService.obterPedidos().subscribe({
      next: (pedidos) => {
        this.listaEntregas = pedidos;
      },
      error: (erro) => console.error('erro ao buscar pedidos:', erro)
    });
  }

  selecionarAba(aba: string) {
    this.abaAtiva = aba;
  }

  toggleMenuPerfil() {
    this.menuPerfilAberto = !this.menuPerfilAberto;
  }

  // toggle selecao: marca ou desmarca o pedido na lista
  toggleSelecaoPedido(id: number) {
    const index = this.pedidosSelecionados.indexOf(id);
    if (index > -1) {
      this.pedidosSelecionados.splice(index, 1);
    } else {
      this.pedidosSelecionados.push(id);
    }
  }

  // otimizar rota: atende tanto a chamada antiga quanto a nova para evitar erros
  otimizarRota(event: MouseEvent) {
    this.otimizarRotaSelecionada(event);
  }

  // otimizar rota selecionada: envia os destinos marcados p/ o fastapi
  otimizarRotaSelecionada(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.pedidosSelecionados.length < 2) {
      alert('selecione pelo menos 2 entregas para calcular a rota.');
      return;
    }

    const destinosSelecionados = this.listaEntregas
      .filter(p => this.pedidosSelecionados.includes(p.id))
      .map(p => ({
        id: p.id,
        endereco: p.endereco,
        latitude: p.latitude,
        longitude: p.longitude
      }));

    this.rotaService.calcularRota(destinosSelecionados).subscribe({
      next: (resposta: any) => {
        console.log('rota otimizada:', resposta);
        alert(`rota otimizada c/ sucesso! dist total: ${resposta.distancia_total_km} km`);
      },
      error: (erro: any) => {
        console.error('erro:', erro);
        alert('erro ao comunicar c/ o backend.');
      }
    });
  }

  abrirConfiguracoes() {
    this.menuPerfilAberto = false;
    alert('Configurações');
  }

  sair() {
    this.menuPerfilAberto = false;
    alert('Sair');
  }
}