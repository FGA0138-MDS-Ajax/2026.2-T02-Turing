import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { mensagemDeErro } from '../../shared/erro.util';
import { UsuarioCreate, Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { HttpResponse } from '@angular/common/http';

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
export class PainelAdmComponent implements OnInit{

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

    public usuarios: Array<Usuario> = [];

    public abaAtiva: Aba = 'listar-usuario';
    public erroLista: String = '';
    public mensagem: Mensagem | null = null;
    public carregando: Boolean = false;
    public cadastrando: Boolean = false;
    public editando: Boolean = false;
    public deletando: Boolean = false;

    public usuarioNovo: UsuarioCreate = {} as UsuarioCreate;
    public usuarioDetalhado: Usuario = {} as Usuario;

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
            next: (response: Array<Usuario>) => {
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
        const inputCadastro = {
            nome: this.usuarioNovo.nome,
            email: this.usuarioNovo.email,
            senha: this.usuarioNovo.senha
        } as UsuarioCreate;
        if(this.usuarioNovo.telefone){
            inputCadastro.telefone = this.usuarioNovo.telefone;
        }

        this.cadastrando = true;
        this._usuarioService.cadastrarUsuario(
            inputCadastro
        ).subscribe({
            next: (response: Usuario) => {
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
            next: (response: HttpResponse<any>) => {
                if(response.status === 204){
                    const idUsuario = this.usuarios.findIndex((usuario) =>
                        usuario.id === this.usuarioDetalhado.id
                    );
                    this.usuarios.splice(idUsuario, 1);
                    this.editando = false;
                    this.abrirLista();
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
        this.usuarioDetalhado = {} as Usuario;
        
        this.selecionarAba('listar-usuario');
    }

    abrirDetalhes(usuario: Usuario): void {
        this.usuarioDetalhado = usuario;
        this.selecionarAba('detalhar-usuario');
    }

}
