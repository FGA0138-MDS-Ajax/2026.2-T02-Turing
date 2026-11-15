import { ChangeDetectorRef, Component } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Perfil, Usuario, UsuarioCreate } from '../../models/usuario.model';
import { AutenticacaoService } from '../../services/autenticacao.service';
import { UsuarioService } from '../../services/usuario.service';
import { Subject, takeUntil } from 'rxjs';
import { mensagemDeErro } from '../../shared/erro.util';
import { LoginInput } from '../../models/autorizacao.model';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';

type Aba = 'login-usuario' | 'cadastro-usuario' | 'usuario-logado';

interface Mensagem {
  tipo: 'erro' | 'sucesso';
  texto: string;
}

type ErrosFormLogin = Partial<Record<keyof LoginInput, string>>;
type ErrosFormCadastro = Partial<Record<keyof UsuarioCreate, string>>;

@Component({
    selector: 'app-autenticacao',
    imports: [CommonModule, FormsModule, NavbarComponent],
    templateUrl: './autenticacao.component.html',
    styleUrls: ['./autenticacao.component.css', '../../shared/painel-base.css']
})
export class AutenticacaoComponent {
    public abaAtiva: Aba = 'login-usuario';
    public mensagem: Mensagem | null = null;

    public formLogin: LoginInput = {} as LoginInput;
    public errosFormLogin: ErrosFormLogin = {};
    public tentouLogar: Boolean = false;
    public logando: Boolean = false;

    public formCadastro: UsuarioCreate = {} as UsuarioCreate;
    public errosFormCadastro: ErrosFormCadastro = {};
    public tentouCadastrar: Boolean = false;
    public cadastrando: Boolean = false;

    public deslogando: Boolean = false;

    private readonly _destroy$ = new Subject<void>();

    constructor(
        private _cdr: ChangeDetectorRef,
        private _autenticacaoService: AutenticacaoService,
        private _usuarioService: UsuarioService,
        private _router: Router
    ){
        if(sessionStorage.getItem('TipoUsuario')){
            this.abaAtiva = 'usuario-logado';
        }
    }

    selecionarAba(aba: string, mensagem: Mensagem | null): void {
        this.mensagem = mensagem;

        this.formLogin = {} as LoginInput;
        this.errosFormLogin = {};
        this.tentouLogar = false;
        this.logando = false;

        this.formCadastro = {} as UsuarioCreate;
        this.errosFormCadastro = {};
        this.tentouCadastrar = false;
        this.cadastrando = false;

        this.abaAtiva = aba as Aba;
        this._cdr.detectChanges();
    }

    deslogarUsuario(): void {
        this.deslogando = true;
        this._autenticacaoService.logout().pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: HttpResponse<any>) => {
                if(response.status === 204){
                    sessionStorage.removeItem('BearerToken');
                    sessionStorage.removeItem('TipoUsuario');
                    const mensagem = {
                        tipo: 'sucesso',
                        texto: `Logout efetuado com sucesso.`
                    } as Mensagem;
                    this.selecionarAba('login-usuario', mensagem)
                    this.deslogando = false;
                }
            },
            error: (erro) => {
                this.deslogando = false;
                this.mensagem = {
                    tipo: 'erro',
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível fazer logout, tente novamente.'
                    )
                };
            }
        });
    }

    logarUsuario(): void {
        this.tentouLogar = true;

        if (!this._validarLogin() || this.logando) {
            return;
        }

        this.logando = true;
        this._autenticacaoService.login(
            this.formLogin
        ).pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response) => {
                sessionStorage.setItem('BearerToken', `${response.tipo.valueOf()} ${response.token.valueOf()}`);
                sessionStorage.setItem('TipoUsuario', response.usuario.perfil);
                if(response.usuario.perfil === Perfil.USUARIO){
                    this._router.navigate(['painel-motorista']);
                }
                if(response.usuario.perfil === Perfil.ADM){
                    this._router.navigate(['painel-adm']);
                }
                this.logando = false;
                this.tentouLogar = false;
            },
            error: (erro) => {
                this.logando = false;
                this.mensagem = {
                    tipo: 'erro',
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível fazer login. Confira os dados e tente de novo.'
                    )
                };
            }
        });
    }

    revalidarLogin(): void {
        if (this.tentouLogar) {
            this._validarLogin();
        }
    }

    private _validarLogin(): boolean {
        const f = this.formLogin;
        const erros: ErrosFormLogin = {};

        const erroEmail = this._validarEmail(f.email);
        if(erroEmail) {
            erros.email = erroEmail;
        };
        const erroSenha = this._validarSenha(f.senha);
        if(erroSenha) {
            erros.senha = erroSenha;
        };

        this.errosFormLogin = erros;
        return Object.keys(erros).length === 0;
    }

    cadastrarUsuario(): void {
        this.tentouCadastrar = true;

        if (!this._validarCadastro() || this.cadastrando) {
            return;
        }

        const inputCadastro = {
            nome: this.formCadastro.nome,
            email: this.formCadastro.email,
            senha: this.formCadastro.senha
        } as UsuarioCreate;
        if(this.formCadastro.telefone){
            inputCadastro.telefone = this.formCadastro.telefone;
        }

        this.cadastrando = true;
        this._usuarioService.cadastrarUsuario(
            inputCadastro
        ).pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Usuario) => {
                const mensagem = {
                    tipo: 'sucesso',
                    texto: `Usuario ${response.nome} cadastrado com sucesso. Faça login para continuar.`
                } as Mensagem;
                this.selecionarAba('login-usuario', mensagem);
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

    revalidarCadastro(): void {
        if (this.tentouCadastrar) {
            this._validarCadastro();
        }
    }

    private _validarCadastro(): boolean {
        const f = this.formCadastro;
        const erros: ErrosFormCadastro = {};

        const erroNome = this._validarNome(f.nome);
        if(erroNome) {
            erros.nome = erroNome;
        };
        const erroEmail = this._validarEmail(f.email);
        if(erroEmail) {
            erros.email = erroEmail;
        };
        const erroSenha = this._validarSenha(f.senha);
        if(erroSenha) {
            erros.senha = erroSenha;
        };
        const erroTelefone = this._validarTelefone(f.telefone);
        if(erroTelefone) {
            erros.telefone = erroTelefone;
        };

        this.errosFormCadastro = erros;
        return Object.keys(erros).length === 0;
    }

    private _validarNome(nome: String): string | null {
        if (nome === undefined || !nome.trim()) {
            return 'Digite um nome.';
        }
        if (nome.trim().length < 4) {
            return 'Nome deve conter ao menos 4 caracteres.';
        }
        return null;
    }

    private _validarEmail(email: String): string | null {
        if (email === undefined || !email.trim()) {
            return 'Digite um e-mail.';
        }
        if (!/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+(\.([a-z]+))?$/i.test(email.valueOf())) {
            return 'Email deve seguir o formato: "fulano@gmail.com".'
        }
        return null;
    }

    private _validarSenha(senha: String): string | null {
        if (senha === undefined || !senha.trim()) {
            return 'Digite uma senha.';
        }
        if ((senha.trim().length < 8) || (senha.trim().length > 20)) {
            return 'Senha deve ter entre 8 e 20 caracteres.';
        }
        return null;
    }

    private _validarTelefone(telefone: String | undefined): string | null {
        if (telefone === undefined || !telefone.trim()) {
            return null;
        }
        if (!/^[1-9]{2}\s9?\d{4}-?\d{4}$/.test(telefone.valueOf())) {
            return 'Telefone deve seguir o formato: "61 99876-5432';
        }
        return null;
    }
}
