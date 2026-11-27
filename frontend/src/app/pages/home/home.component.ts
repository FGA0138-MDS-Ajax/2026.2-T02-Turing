
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AutenticacaoService } from '../../services/autenticacao.service';
import { Mensagem, TipoMensagem } from '../../models/mensagem.model';
import { Subject, takeUntil } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
import { mensagemDeErro } from '../../shared/erro.util';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  public mensagem: Mensagem | null = null;
  public tipoUsuario: string = '';
  public bearer: boolean = false;
  public deslogando: boolean = false;

  private readonly _destroy$ = new Subject<void>();

  constructor(
    private _autenticacaoService: AutenticacaoService
  ) {
    this.checarUsuario();
  }

  checarUsuario(): void {
    this.mensagem = null;
    this.tipoUsuario =
      sessionStorage.getItem('TipoUsuario') || '';

    this.bearer = Boolean(
      sessionStorage.getItem('BearerToken')
    );
  }

  deslogar(): void {
    this.deslogando = true;

    this._autenticacaoService.logout()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response: HttpResponse<any>) => {
          if (response.status === 204) {
            this._autenticacaoService.removerSessionLogin();
            this.deslogando = false;
            this.checarUsuario();
          }
        },
        error: (erro) => {
          this.mensagem = {
            tipo: TipoMensagem.ERRO,
            texto: mensagemDeErro(
              erro,
              'Não foi possível fazer logout, tente novamente.'
            )
          };

          this.deslogando = false;
        }
      });
  }
}