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
import { limpaCampoTelefoneUsuario, telefonesUsuarioIguais, validarEmailUsuario, validarNomeUsuario, validarSenhaUsuario, validarTelefoneUsuario } from '../../shared/validacaoUsuario.util';
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
    public tentouEditarSenha: boolean = false;
    public alterarSenha: boolean = false;

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

    public checkAdm(): void {
        this.isAdm = Boolean(sessionStorage.getItem('TipoUsuario') === 'ADM') && Boolean(sessionStorage.getItem('BearerToken'));
    }

    public deslogar():void {
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

    public atualizarListaUsuarios(): void {
        this.listarUsuarios();
        this._cdr.detectChanges();
    };

    public selecionarAba(aba: string, mensagem: Mensagem | null): void {
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

    public abrirDetalhes(usuario: Usuario): void {
        this.usuarioDetalhado = usuario;

        this.selecionarAba('detalhar-usuario', null);
    }

    public abrirEdicao(usuario: Usuario): void {
        this.tentouEditar = false;
        this.editando = false;
        this.errosFormEdicao = {};

        this.usuarioEditado = usuario;
        this.formEdicao = {
            nome: usuario.nome,
            email: usuario.email,
            ativo: usuario.ativo,
            telefone: usuario.telefone,
            perfil: usuario.perfil
        };

        this.selecionarAba('editar-usuario', null);
    }

    public abrirEdicaoSenha(): void {
        this.alterarSenha = true;
    }

    public fecharEdicaoSenha(mensagem: Mensagem | null): void {
        this.formEdicao = {
            nome: this.formEdicao.nome,
            email: this.formEdicao.email,
            ativo: this.formEdicao.ativo,
            telefone: this.formEdicao.telefone,
            perfil: this.formEdicao.perfil
        };
        this.errosFormEdicao = {};
        this.revalidarEdicao();

        this.tentouEditarSenha = false;
        this.mensagem = mensagem;
        this.alterarSenha = false;
    }

    public listarUsuarios(): void {
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
                console.log(erro);
                this.usuarios = [];
                this.erroLista = mensagemDeErro(erro, 'Não foi possível carregar os usuários. Tente novamente mais tarde.');
                this.carregando = false;
            }
        });
    }
    
    public cadastrarUsuario(): void {
        this.tentouCadastrar = true;
        
        if(!this._validarCadastro() || this.cadastrando){
            return;
        }
            
        this.cadastrando = true;
        this._usuarioService.cadastrarUsuario(
            this._setUsuarioCadastroInput()
        ).subscribe({
            next: (response: Usuario) => {
                this.usuarios.push(response);
                const mensagem = {
                    tipo: TipoMensagem.SUCESSO,
                    texto: `Usuário ${response.nome} cadastrado com sucesso.`
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
                        'Não foi possível cadastrar o usuário. Confira os dados e tente novamente.'
                    )
                };
                this.tentouCadastrar = false;
                this.cadastrando = false;
            }
        });
    }

    public reativarUsuario(): void {
        this.editando = true;

        this._usuarioService.atualizarUsuario(
            this.usuarioEditado.id,
            this._setUsuarioReativarInput()
        ).pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Usuario) => {
                this.atualizarListaUsuarios();
                const mensagem = {
                    tipo: TipoMensagem.SUCESSO,
                    texto: `Usuário ${response.nome} reativado com sucesso.`
                } as Mensagem;
                this.editando = false;
                this.selecionarAba('listar-usuario', mensagem);
            },
            error: (erro) => {
                this.mensagem = {
                    tipo: TipoMensagem.ERRO,
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível reativar o usuário. Tente novamente mais tarde.'
                    )
                };
                this.editando = false;
            }
        });
    }

    public desativarUsuario(): void {
        this.editando = true;

        this._usuarioService.excluirUsuario(
            this.usuarioEditado.id
        ).pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: HttpResponse<any>) => {
                if(response.status === 204){
                    this.atualizarListaUsuarios();
                    const mensagem = {
                        tipo: TipoMensagem.SUCESSO,
                        texto: `Usuário ${this.usuarioEditado.nome} desativado com sucesso.`
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
                        'Não foi possível desativar o usuário. Tente novamente mais tarde.'
                    )
                };
                this.editando = false;
            }
        });
    }

    public atualizarUsuario(): void {
        this.tentouEditar = true;

        const erroValidar: erroEdicao = this._validarEdicao();
        
        if(erroValidar === 'validacao' || this.editando) {
            return;
        }else if(erroValidar === 'igual') {
            this.mensagem = {
                    tipo: TipoMensagem.ERRO,
                    texto: `Nenhuma mudança a ser efetivada.`
                } as Mensagem;
            this.tentouEditar = false;
            this.editando = false;
            return;
        }

        this.editando = true;
        this._usuarioService.atualizarUsuario(
            this.usuarioEditado.id,
            this._setUsuarioAtualizarInput()
        ).pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Usuario) => {
                this.atualizarListaUsuarios();
                const mensagem = {
                    tipo: TipoMensagem.SUCESSO,
                    texto: `Usuário ${response.nome} atualizado com sucesso.`
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

    public atualizarSenhaUsuario(): void {
        this.tentouEditarSenha = true;
        
        if(!this._validarEdicaoSenha() || this.editando) {
            return;
        }

        this.editando = true;
        this._usuarioService.atualizarUsuario(
            this.usuarioEditado.id,
            this._setUsuarioAtualizarSenhaInput()
        ).pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Usuario) => {
                this.atualizarListaUsuarios();
                const mensagem = {
                    tipo: TipoMensagem.SUCESSO,
                    texto: `Senha do usuário ${response.nome} alterada com sucesso.`
                } as Mensagem;
                this.editando = false;
                this.fecharEdicaoSenha(mensagem);
            },
            error: (erro) => {
                const mensagem = {
                    tipo: TipoMensagem.ERRO,
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível alterar senha. Tente novamente mais tarde.'
                    )
                };
                this.editando = false;
                this.fecharEdicaoSenha(mensagem);
            }
        });
    }

    private _setUsuarioCadastroInput(): UsuarioCreateRequest {
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

    private _setUsuarioAtualizarInput(): UsuarioUpdateRequest {
        const input: UsuarioUpdateRequest = {} as UsuarioUpdateRequest;

        if(this.formEdicao.nome != this.usuarioEditado.nome) {
            input.nome = this.formEdicao.nome;
        }
        if(this.formEdicao.email != this.usuarioEditado.email) {
            input.email = this.formEdicao.email;
        }
        if(!telefonesUsuarioIguais(
            this.formEdicao.telefone,
            this.usuarioEditado.telefone
        )) {
            input.telefone = limpaCampoTelefoneUsuario(this.formEdicao.telefone);
        }
        if(this.formEdicao.perfil != this.usuarioEditado.perfil) {
            input.perfil = this.formEdicao.perfil;
        }

        return input;
    }

    private _setUsuarioAtualizarSenhaInput(): UsuarioUpdateRequest {
        const input: UsuarioUpdateRequest = {} as UsuarioUpdateRequest;

        input.senha = this.formEdicao.senha;

        return input;
    }

    private _setUsuarioReativarInput(): UsuarioUpdateRequest {
        const input: UsuarioUpdateRequest = {} as UsuarioUpdateRequest;

        input.ativo = true;

        return input;
    }

    public revalidarCadastro(): void {
        this.mensagem = null;
        if (this.tentouCadastrar) {
            this._validarCadastro();
        }
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

    public revalidarEdicao(): void {
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
            telefonesUsuarioIguais(f.telefone, this.usuarioEditado.telefone) &&
            f.perfil === this.usuarioEditado.perfil
        ) {
            return 'igual';
        }

        return '';
    }

    public revalidarEdicaoSenha(): void {
        this.mensagem = null;
        if (this.tentouEditarSenha) {
            this._validarEdicaoSenha();
        }
    }

    private _validarEdicaoSenha(): boolean {
        const f = this.formEdicao;
        const erros: ErrosFormEdicao = {};

        const erroSenha = validarSenhaUsuario(f.senha);
        if(erroSenha) {
            erros.senha = erroSenha;
        };

        this.errosFormEdicao = erros;
        return Object.keys(erros).length === 0;
    }
}
