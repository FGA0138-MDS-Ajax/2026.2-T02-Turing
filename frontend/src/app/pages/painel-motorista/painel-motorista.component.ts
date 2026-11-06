import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-painel-motorista',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './painel-motorista.component.html',
  styleUrls: ['./painel-motorista.component.css']
})
export class PainelMotoristaComponent {
  // guarda a aba atual
  abaAtiva: string = 'enderecos';
  
  // controla o menu do perfil
  menuPerfilAberto: boolean = false;

  // muda a aba ativa
  selecionarAba(aba: string) {
    this.abaAtiva = aba;
  }

  // abre ou fecha o menu dropdown do perfil
  toggleMenuPerfil() {
    this.menuPerfilAberto = !this.menuPerfilAberto;
  }

  // acao de config
  abrirConfiguracoes() {
    this.menuPerfilAberto = false;
    alert('Configurações');
  }

  // acao de logout
  sair() {
    this.menuPerfilAberto = false;
    alert('Sair');
  }
}