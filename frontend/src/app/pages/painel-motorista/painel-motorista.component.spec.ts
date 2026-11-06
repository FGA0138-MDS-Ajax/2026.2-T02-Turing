import { Component } from '@angular/core';

@Component({
  selector: 'app-painel-motorista',
  templateUrl: './painel-motorista.component.html',
  styleUrls: ['./painel-motorista.component.css']
})
export class PainelMotoristaComponent {
  
  abaAtiva: 'feedback' | 'perfil' | 'notificacoes' | 'enderecos' = 'enderecos';

  selecionarAba(aba: 'feedback' | 'perfil' | 'notificacoes' | 'enderecos') {
    this.abaAtiva = aba;
  }
}