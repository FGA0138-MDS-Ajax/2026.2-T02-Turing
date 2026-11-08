import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface AbaNavegacao {
  id: string;
  rotulo: string;
}

// barra superior usada pelos paineis. o que for colocado dentro da tag
// (ex: sino de notificações - q tem q ver com o back tb -,, menu de perfil) aparece no canto direito
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="navbar">
      <a class="logo" [routerLink]="rotaLogo">OpenRoute</a>

      <nav class="abas" aria-label="Seções do painel">
        <button
          type="button"
          class="aba"
          *ngFor="let aba of abas"
          [class.ativa]="aba.id === abaAtiva"
          [attr.aria-current]="aba.id === abaAtiva ? 'page' : null"
          (click)="abaSelecionada.emit(aba.id)"
        >
          {{ aba.rotulo }}
        </button>
      </nav>

      <div class="extra"><ng-content></ng-content></div>
    </header>
  `,
  styles: [`
    .navbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem 1.5rem;
      padding: 0.75rem 1.5rem;
      background: var(--superficie, #ffffff);
      border-bottom: 1px solid var(--linha, #e2e8f0);
    }

    .logo {
      font-size: 1.2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: var(--tinta, #0f172a);
      text-decoration: none;
    }

    .abas {
      display: flex;
      flex: 1;
      gap: 0.25rem;
      overflow-x: auto;
    }

    .aba {
      padding: 0.5rem 0.8rem;
      border: 0;
      background: transparent;
      font: inherit;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--texto-suave, #64748b);
      cursor: pointer;
      white-space: nowrap;
    }

    .aba:hover {
      color: var(--tinta, #0f172a);
      background: #f1f5f9;
    }

    .aba.ativa {
      font-weight: 600;
      color: var(--tinta, #0f172a);
      box-shadow: inset 0 -2px 0 var(--acao, #2563eb);
    }

    .logo:focus-visible,
    .aba:focus-visible {
      outline: 2px solid var(--acao, #2563eb);
      outline-offset: 2px;
    }

    @media (max-width: 640px) {
      .navbar {
        padding: 0.75rem 1rem;
      }
    }
  `]
})
export class NavbarComponent {
  @Input() abas: AbaNavegacao[] = [];
  @Input() abaAtiva = '';
  @Input() rotaLogo = '/';
  @Output() abaSelecionada = new EventEmitter<string>();
}