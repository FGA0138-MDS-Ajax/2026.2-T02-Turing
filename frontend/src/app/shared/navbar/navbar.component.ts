
import { DOCUMENT, CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { RouterLink } from '@angular/router';

export interface AbaNavegacao {
  id: string;
  rotulo: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],

  template: `
    <header class="navbar">
      <div class="navbar-interior">

        <a class="logo" [routerLink]="rotaLogo">
          Open<span>Route</span>
          <span class="logo-marca" aria-hidden="true"></span>
        </a>

        <nav
          *ngIf="abas.length > 0"
          class="abas"
          aria-label="Seções do painel"
        >
          <button
            type="button"
            class="aba"
            *ngFor="let aba of abas"
            [class.ativa]="aba.id === abaAtiva"
            [attr.aria-current]="
              aba.id === abaAtiva ? 'page' : null
            "
            (click)="abaSelecionada.emit(aba.id)"
          >
            {{ aba.rotulo }}
          </button>
        </nav>

        <div class="navbar-direita">

          <div
            class="controles-acessibilidade"
            aria-label="Opções de acessibilidade"
          >

            <button
              type="button"
              class="controle-tema"
              (click)="alternarTema()"
              [attr.aria-pressed]="temaEscuro"
              [attr.aria-label]="
                temaEscuro
                  ? 'Ativar modo claro'
                  : 'Ativar modo escuro'
              "
              [title]="
                temaEscuro
                  ? 'Ativar modo claro'
                  : 'Ativar modo escuro'
              "
            >
              <span class="icone-tema" aria-hidden="true">
                {{ temaEscuro ? '☀' : '☾' }}
              </span>

              <span class="legenda-tema">
                {{ temaEscuro ? 'Modo claro' : 'Modo escuro' }}
              </span>
            </button>

            <span
              class="separador-controles"
              aria-hidden="true"
            ></span>

            <div
              class="controles-fonte"
              role="group"
              aria-label="Tamanho do texto"
            >
              <button
                type="button"
                (click)="diminuirFonte()"
                [disabled]="tamanhoFonte <= 90"
                aria-label="Diminuir tamanho do texto"
                title="Diminuir letras"
              >
                A−
              </button>

              <button
                type="button"
                (click)="restaurarFonte()"
                aria-label="Restaurar tamanho padrão do texto"
                title="Tamanho padrão"
              >
                A
              </button>

              <button
                type="button"
                (click)="aumentarFonte()"
                [disabled]="tamanhoFonte >= 130"
                aria-label="Aumentar tamanho do texto"
                title="Aumentar letras"
              >
                A+
              </button>
            </div>

          </div>

          <div class="extra">
            <ng-content></ng-content>
          </div>

        </div>
      </div>
    </header>
  `,

  styles: [`
    :host {
      display: block;
    }

    .navbar {
      background: var(--or-fundo);
      border-bottom: 1px solid var(--or-linha);
      color: var(--or-texto);
    }

    .navbar-interior {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      width: 100%;
      max-width: 1600px;
      min-height: 82px;
      margin: 0 auto;
      padding: 0.85rem 2.6rem;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      flex-shrink: 0;
      color: var(--or-texto);
      font-size: 1.55rem;
      font-weight: 800;
      letter-spacing: -0.055em;
      text-decoration: none;
    }

    .logo > span:first-child {
      color: var(--or-texto);
    }

    .logo-marca {
      width: 12px;
      height: 12px;
      margin-left: 0.4rem;
      border-radius: 50% 50% 50% 0;
      background: var(--or-terracota);
      transform: rotate(-45deg);
      box-shadow: 10px -6px 0 -3px var(--or-dourado);
    }

    .abas {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 0.2rem;
      overflow-x: auto;
    }

    .aba {
      padding: 0.55rem 0.8rem;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--or-texto-suave);
      font: inherit;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
    }

    .aba:hover {
      background: var(--or-hover);
      color: var(--or-texto);
    }

    .aba.ativa {
      background: var(--or-hover);
      color: var(--or-texto);
      box-shadow: inset 0 -2px 0 var(--or-dourado);
    }

    .navbar-direita {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1;
      gap: 1.25rem;
      margin-left: auto;
    }

    .controles-acessibilidade {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      flex-shrink: 0;
      padding: 0.3rem;
      border: 1px solid var(--or-linha);
      border-radius: 13px;
      background: var(--or-superficie);
    }

    .controle-tema {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0.35rem 0.55rem;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--or-texto);
      font: inherit;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }

    .controle-tema:hover {
      background: var(--or-hover);
    }

    .icone-tema {
      font-size: 1.3rem;
      line-height: 1;
    }

    .separador-controles {
      height: 23px;
      border-left: 1px solid var(--or-linha);
    }

    .controles-fonte {
      display: flex;
      align-items: center;
    }

    .controles-fonte button {
      min-width: 31px;
      min-height: 32px;
      padding: 0.2rem;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--or-texto);
      font: inherit;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
    }

    .controles-fonte button:hover:not(:disabled) {
      background: var(--or-hover);
    }

    .controles-fonte button:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .extra {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    .logo:focus-visible,
    .aba:focus-visible,
    .controle-tema:focus-visible,
    .controles-fonte button:focus-visible {
      outline: 3px solid var(--or-dourado);
      outline-offset: 3px;
    }

    @media (max-width: 900px) {
      .navbar-interior {
        flex-wrap: wrap;
        padding: 0.85rem 1.25rem;
      }

      .abas {
        order: 3;
        flex: 0 0 100%;
      }
    }

    @media (max-width: 640px) {
      .navbar-interior {
        justify-content: space-between;
        gap: 0.8rem;
      }

      .logo {
        font-size: 1.35rem;
      }

      .navbar-direita {
        flex-basis: 100%;
        flex-wrap: wrap;
        justify-content: space-between;
      }

      .legenda-tema {
        display: none;
      }

      .extra {
        margin-left: auto;
      }
    }
  `]
})
export class NavbarComponent implements OnInit {

  @Input() abas: AbaNavegacao[] = [];
  @Input() abaAtiva = '';
  @Input() rotaLogo = '/';

  @Output() abaSelecionada = new EventEmitter<string>();

  public temaEscuro = false;
  public tamanhoFonte = 100;

  constructor(
    @Inject(DOCUMENT) private readonly documento: Document
  ) {}

  ngOnInit(): void {
    const temaSalvo = this.lerPreferencia('openroute-tema');

    this.temaEscuro = temaSalvo === 'escuro';

    const fonteSalva = Number(
      this.lerPreferencia('openroute-fonte')
    );

    if (
      Number.isFinite(fonteSalva) &&
      fonteSalva >= 90 &&
      fonteSalva <= 130
    ) {
      this.tamanhoFonte = fonteSalva;
    }

    this.aplicarPreferencias();
  }

  public alternarTema(): void {
    this.temaEscuro = !this.temaEscuro;

    this.aplicarPreferencias();

    this.salvarPreferencia(
      'openroute-tema',
      this.temaEscuro ? 'escuro' : 'claro'
    );
  }

  public diminuirFonte(): void {
    this.tamanhoFonte = Math.max(
      90,
      this.tamanhoFonte - 10
    );

    this.atualizarFonte();
  }

  public aumentarFonte(): void {
    this.tamanhoFonte = Math.min(
      130,
      this.tamanhoFonte + 10
    );

    this.atualizarFonte();
  }

  public restaurarFonte(): void {
    this.tamanhoFonte = 100;
    this.atualizarFonte();
  }

  private atualizarFonte(): void {
    this.aplicarPreferencias();

    this.salvarPreferencia(
      'openroute-fonte',
      String(this.tamanhoFonte)
    );
  }

  private aplicarPreferencias(): void {
    const raiz = this.documento.documentElement;

    raiz.setAttribute(
      'data-openroute-tema',
      this.temaEscuro ? 'escuro' : 'claro'
    );

    raiz.style.fontSize = this.tamanhoFonte + '%';
  }

  private lerPreferencia(chave: string): string | null {
    try {
      return (
        this.documento.defaultView?.localStorage.getItem(chave)
        ?? null
      );
    } catch {
      return null;
    }
  }

  private salvarPreferencia(
    chave: string,
    valor: string
  ): void {
    try {
      this.documento.defaultView?.localStorage.setItem(
        chave,
        valor
      );
    } catch {
      // O controle continua funcionando na sessão atual.
    }
  }
}