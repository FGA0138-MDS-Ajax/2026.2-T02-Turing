import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { mensagemDeErro } from '../../shared/erro.util';
import { UsuarioCreate, UsuarioResponse } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';

type Aba = 'listar-usuario' | 'cadastrar-usuario' | 'detalhar-usuario';

interface Mensagem {
  tipo: 'erro' | 'sucesso';
  texto: string;
}

@Component({
    selector: 'app-painel-adm',
    imports: [CommonModule, FormsModule, NavbarComponent],
    templateUrl: './painel-adm.component.html',
    styleUrls: ['./painel-adm.component.css', '../../shared/painel-base.css']
})
export class AdmRestricoesComponent implements OnInit{

    readonly abas = [
        { id: 'listar-usuario', rotulo: 'Usuários' }
    ];

  get abaDestaque(): string {
    if(
        this.abaAtiva === 'listar-usuario' ||
        this.abaAtiva === 'cadastrar-usuario' ||
        this.abaAtiva === 'detalhar-usuario'
    ) {
        return 'listar-usuario';
    }
    return '';
  }

    public usuarios: Array<UsuarioResponse> = [];

    public abaAtiva: Aba = 'listar-usuario';
    public erroLista: String = '';
    public mensagem: Mensagem | null = null;
    public carregando: Boolean = false;
    public cadastrando: Boolean = false;
    public editando: Boolean = false;
    public deletando: Boolean = false;

    public usuarioNovo: UsuarioCreate = {} as UsuarioCreate;
    public usuarioDetalhado: UsuarioResponse = {} as UsuarioResponse;

    private readonly _destroy$ = new Subject<void>();

    constructor(
        private _cdr: ChangeDetectorRef,
        private _usuarioService: UsuarioService
    ){}

    ngOnInit(){
        this.atualizarListaUsuarios();
    }

    atualizarListaUsuarios(): void {
        this.carregando = true;
        this.obterUsuarios();
        this._cdr.detectChanges();
    };

    selecionarAba(aba: string): void {
        this.abaAtiva = aba as Aba;
        this.mensagem = null;
    }

    obterUsuarios(): void {
        this.carregando = true;
        this.erroLista = '';

        this._usuarioService.obterUsuarios().pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Array<UsuarioResponse>) => {
                this.carregando = false;
                this.usuarios = response;
            },
            error: (erro) => {
                this.carregando = false;
                this.erroLista = mensagemDeErro(erro, 'Não foi possível carregar os usuarios.');
            }
        });
    }
    
    cadastrarUsuario(): void {
        this._usuarioService.cadastrarUsuario(
            this.usuarioNovo
        ).subscribe({
            next: (response: UsuarioResponse) => {
                this.usuarios.push(response);
                this.cadastrando = false;
                this.abrirLista();
            },
            error: (erro) => {
                this.cadastrando = false;
                this.mensagem = {
                    tipo: 'erro',
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível cadastrar. Confira os dados e tente de novo.'
                    )
                };
            }
        });
    }

    excluirUsuario(): void {
        this.editando = true;

        this._usuarioService.excluirUsuario(
            this.usuarioDetalhado.id
        ).pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: String) => {
                if(response === ""){
                    const idUsuario = this.usuarios.findIndex((usuario) =>
                        usuario.id === this.usuarioDetalhado.id
                    );
                    this.usuarios.splice(idUsuario, 1);
                    this.editando = false;
                    this.abrirLista();
                } else {
                    this.mensagem = {
                        tipo: 'erro',
                        texto: mensagemDeErro(
                            {},
                            'Erro inesperado.'
                        )
                    };
                }
            },
            error: (erro) => {
                this.editando = false;
                this.mensagem = {
                    tipo: 'erro',
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível excluir. Tente novamente mais tarde.'
                    )
                };
            }
        });
    }
    
    abrirLista(): void {
        this._cdr.detectChanges();

        this.usuarioNovo = {} as UsuarioCreate;
        this.usuarioDetalhado = {} as UsuarioResponse;
        
        this.selecionarAba('listar-usuario');
    }

    abrirDetalhes(usuario: UsuarioResponse): void {
        this.usuarioDetalhado = usuario;
        this.selecionarAba('detalhar-usuario');
    }

}
