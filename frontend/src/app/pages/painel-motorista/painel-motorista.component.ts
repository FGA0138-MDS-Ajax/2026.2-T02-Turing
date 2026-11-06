import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 

@Component({
  selector: 'app-painel-motorista',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './painel-motorista.component.html',
  styleUrls: ['./painel-motorista.component.css']
})
export class PainelMotoristaComponent {
  //variaveis q o html busca
  abaAtiva: 'feedback' | 'perfil' | 'notificacoes' | 'enderecos' = 'enderecos';

  // função q o html chama com o click
  selecionarAba(aba: 'feedback' | 'perfil' | 'notificacoes' | 'enderecos') {
    this.abaAtiva = aba;
  }
}