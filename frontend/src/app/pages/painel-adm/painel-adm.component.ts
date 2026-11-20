import { ChangeDetectorRef, Component, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { mensagemDeErro } from '../../shared/erro.util';
import { UsuarioCreateRequest, Usuario, UsuarioUpdateRequest } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { HttpResponse } from '@angular/common/http';
import { Mensagem, TipoMensagem } from '../../models/mensagem.model';
import { validarEmailUsuario, validarNomeUsuario, validarSenhaUsuario, validarTelefoneUsuario } from '../../shared/validacaoUsuario.util';
import { AutenticacaoService } from '../../services/autenticacao.service';
import { Router } from '@angular/router';

type Aba = 'listar-usuario' | 'cadastrar-usuario' | 'editar-usuario' | 'detalhar-usuario';
type erroEdicao = '' | 'validacao' | 'igual';

type ErrosFormEdicao = Partial<Record<keyof UsuarioUpdateRequest, string>>;
type ErrosFormCadastro = Partial<Record<keyof UsuarioCreateRequest, string>>;

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
            this.abaAtiva === 'editar-usuario' ||
            this.abaAtiva === 'detalhar-usuario'
        ) {
            return 'listar-usuario';
        }
        return '';
    }

    public usuarios: Array<Usuario> = [];

    public abaAtiva: Aba = 'listar-usuario';

    public isAdm: boolean = false;
    public deslogando: boolean = false;

    public mensagem: Mensagem | null = null;
    public carregando: boolean = false;
    public erroLista: string = '';

    public formCadastro: UsuarioCreateRequest = {} as UsuarioCreateRequest;
    public errosFormCadastro: ErrosFormCadastro = {};
    public tentouCadastrar: boolean = false;
    public cadastrando: boolean = false;

    public usuarioEditado: Usuario = {} as Usuario;
    public formEdicao: UsuarioUpdateRequest = {} as UsuarioUpdateRequest;
    public errosFormEdicao: ErrosFormEdicao = {};
    public tentouEditar: boolean = false;
    public editando: boolean = false;

    public usuarioDetalhado: Usuario = {} as Usuario;

    private readonly _destroy$ = new Subject<void>();

    constructor(
        private _cdr: ChangeDetectorRef,
        private _router: Router,
        private _usuarioService: UsuarioService,
        private _autenticacaoService: AutenticacaoService
    ){}

    ngOnInit(): void {
        this.checkAdm();
        this.atualizarListaUsuarios();
    }

    checkAdm(): void {
        this.isAdm = Boolean(sessionStorage.getItem('TipoUsuario') === 'ADM') && Boolean(sessionStorage.getItem('BearerToken'));
    }

    deslogar():void {
        this.deslogando = true;

        this._autenticacaoService.logout().pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: HttpResponse<any>) => {
                if(response.status === 204){
                    this._autenticacaoService.removerSessionLogin();
                    this.deslogando = false;
                    this._router.navigate(['home']);
                }
            },
            error: (erro) => {
                this.mensagem = {
                    tipo: TipoMensagem.ERRO,
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível fazer logout, tente novamente.'
                    )
                } as Mensagem;
                this.deslogando = false;
            }
        });
    }

    atualizarListaUsuarios(): void {
        this.obterUsuarios();
        this._cdr.detectChanges();
    };

    selecionarAba(aba: string, mensagem: Mensagem | null): void {
        if(!this.isAdm){
            return
        }

        this.mensagem = mensagem;

        this.formCadastro = {} as UsuarioCreateRequest;
        this.errosFormCadastro = {};
        this.tentouCadastrar = false;
        this.cadastrando = false;

        this.abaAtiva = aba as Aba;
    }

    obterUsuarios(): void {
        this.carregando = true;
        this.erroLista = '';

        this._usuarioService.listarUsuarios().pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Array<Usuario>) => {
                this.usuarios = response;
                this.carregando = false;
            },
            error: (erro) => {
                this.usuarios = [];
                this.erroLista = mensagemDeErro(erro, 'Não foi possível carregar os usuários. Tente novamente');
                this.carregando = false;
            }
        });
    }
    
    cadastrarUsuario(): void {
        this.tentouCadastrar = true;
        
        if(!this._validarCadastro() || this.cadastrando){
            return;
        }
            
        this.cadastrando = true;
        this._usuarioService.cadastrarUsuario(
            this._setUsuarioCreateInput()
        ).subscribe({
            next: (response: Usuario) => {
                this.usuarios.push(response);
                const mensagem = {
                    tipo: TipoMensagem.SUCESSO,
                    texto: `Usuario ${response.nome} cadastrado com sucesso.`
                } as Mensagem;
                this.tentouCadastrar = false;
                this.cadastrando = false;
                this.selecionarAba('listar-usuario', mensagem);
            },
            error: (erro) => {
                this.mensagem = {
                    tipo: TipoMensagem.ERRO,
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível cadastrar. Confira os dados e tente de novo.'
                    )
                };
                this.tentouCadastrar = false;
                this.cadastrando = false;
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
                    const mensagem = {
                        tipo: TipoMensagem.SUCESSO,
                        texto: `Usuario ${this.usuarioDetalhado.nome} desativado com sucesso.`
                    } as Mensagem;
                    this.editando = false;
                    this.selecionarAba('listar-usuario', mensagem);
                }
            },
            error: (erro) => {
                this.mensagem = {
                    tipo: TipoMensagem.ERRO,
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível excluir. Tente novamente mais tarde.'
                    )
                };
                this.editando = false;
            }
        });
    }

    atualizarUsuario(): void {
        this.tentouEditar = true;

        const erroValidar: erroEdicao = this._validarEdicao();
        
        if(erroValidar === 'validacao' || this.editando) {
            return;
        }else if(erroValidar === 'igual') {
            this.mensagem = {
                    tipo: TipoMensagem.ERRO,
                    texto: `Nenhum dado foi alterado.`
                } as Mensagem;
            this.tentouEditar = false;
            this.editando = false;
            return;
        }

        this.editando = true;
        this._usuarioService.atualizarUsuario(
            this.usuarioEditado.id,
            this._setUsuarioUpdateInput()
        ).pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Usuario) => {
                this.atualizarListaUsuarios();
                const mensagem = {
                    tipo: TipoMensagem.SUCESSO,
                    texto: `Usuario ${response.nome} atualizado com sucesso.`
                } as Mensagem;
                this.tentouEditar = false;
                this.editando = false;
                this.selecionarAba('listar-usuario', mensagem);
            },
            error: (erro) => {
                this.mensagem = {
                    tipo: TipoMensagem.ERRO,
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível atualizar o usuário. Tente novamente mais tarde.'
                    )
                };
                this.tentouEditar = false;
                this.editando = false;
            }
        });
    }

    abrirDetalhes(usuario: Usuario): void {
        this.usuarioDetalhado = usuario;

        this.selecionarAba('detalhar-usuario', null);
    }

    abrirEdicao(usuario: Usuario): void {
        this.tentouEditar = false;
        this.editando = false;
        this.errosFormEdicao = {};

        this.usuarioEditado = usuario;
        this.formEdicao = {
            nome: usuario.nome,
            email: usuario.email,
            ativo: usuario.ativo,
            telefone: usuario.telefone != null ? usuario.telefone : undefined
        };

        this.selecionarAba('editar-usuario', null);
    }

    revalidarCadastro(): void {
        this.mensagem = null;
        if (this.tentouCadastrar) {
            this._validarCadastro();
        }
    }

    private _setUsuarioCreateInput(): UsuarioCreateRequest {
        const input: UsuarioCreateRequest = {
            nome: this.formCadastro.nome,
            email: this.formCadastro.email,
            senha: this.formCadastro.senha
        } as UsuarioCreateRequest;

        if(this.formCadastro.telefone){
            input.telefone = this.formCadastro.telefone;
        }

        return input;
    }

    private _validarCadastro(): boolean {
        const f = this.formCadastro;
        const erros: ErrosFormCadastro = {};

        const erroNome = validarNomeUsuario(f.nome);
        if(erroNome) {
            erros.nome = erroNome;
        };
        const erroEmail = validarEmailUsuario(f.email);
        if(erroEmail) {
            erros.email = erroEmail;
        };
        const erroSenha = validarSenhaUsuario(f.senha);
        if(erroSenha) {
            erros.senha = erroSenha;
        };
        const erroTelefone = validarTelefoneUsuario(f.telefone);
        if(erroTelefone) {
            erros.telefone = erroTelefone;
        };

        this.errosFormCadastro = erros;
        return Object.keys(erros).length === 0;
    }

    private _setUsuarioUpdateInput(): UsuarioUpdateRequest {
        const input: UsuarioUpdateRequest = {} as UsuarioUpdateRequest;

        if(this.formEdicao.nome != this.usuarioEditado.nome) {
            input.nome = this.formEdicao.nome;
        }
        if(this.formEdicao.email != this.usuarioEditado.email) {
            input.email = this.formEdicao.email;
        }
        if(this.formEdicao.telefone != this.usuarioEditado.telefone) {
            input.telefone = this.formEdicao.telefone;
        }
        if(this.formEdicao.ativo != this.usuarioEditado.ativo) {
            input.ativo = this.formEdicao.ativo;
        }

        return input;
    }

    revalidarEdicao(): void {
        this.mensagem = null;
        if (this.tentouEditar) {
            this._validarEdicao();
        }
    }

    private _validarEdicao(): erroEdicao {
        const f = this.formEdicao;
        const erros: ErrosFormEdicao = {};

        const erroNome = validarNomeUsuario(f.nome);
        if(erroNome) {
            erros.nome = erroNome;
        };
        const erroEmail = validarEmailUsuario(f.email);
        if(erroEmail) {
            erros.email = erroEmail;
        };
        const erroTelefone = validarTelefoneUsuario(f.telefone);
        if(erroTelefone) {
            erros.telefone = erroTelefone;
        };

        this.errosFormEdicao = erros;

        if(Object.keys(erros).length != 0) {
            return 'validacao';
        }

        if(
            f.nome === this.usuarioEditado.nome &&
            f.email === this.usuarioEditado.email &&
            (
                (
                    f.telefone === undefined &&
                    (
                        this.usuarioEditado.telefone === null
                    )
                ) ||
                (
                    f.telefone === this.usuarioEditado.telefone
                )
            ) &&
            f.ativo === this.usuarioEditado.ativo
        ) {
            return 'igual';
        }

        return '';
    }
}
