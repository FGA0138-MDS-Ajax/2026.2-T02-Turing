import { ChangeDetectorRef, Component } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Perfil, Usuario, UsuarioCreateRequest } from '../../models/usuario.model';
import { AutenticacaoService } from '../../services/autenticacao.service';
import { UsuarioService } from '../../services/usuario.service';
import { Subject, takeUntil } from 'rxjs';
import { mensagemDeErro } from '../../shared/erro.util';
import { LoginInput } from '../../models/autorizacao.model';
import { Router } from '@angular/router';
import { HttpResponse } from '@angular/common/http';
import { Mensagem, TipoMensagem } from '../../models/mensagem.model';
import { validarEmailUsuario, validarNomeUsuario, validarSenhaUsuario, validarTelefoneUsuario } from '../../shared/validacaoUsuario.util';

type Aba = 'login-usuario' | 'cadastro-usuario' | 'usuario-logado';

type ErrosFormLogin = Partial<Record<keyof LoginInput, string>>;
type ErrosFormCadastro = Partial<Record<keyof UsuarioCreateRequest, string>>;

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

    public formCadastro: UsuarioCreateRequest = {} as UsuarioCreateRequest;
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
        if(sessionStorage.getItem('TipoUsuario') && sessionStorage.getItem('BearerToken')){
            this.abaAtiva = 'usuario-logado';
        }
    }

    selecionarAba(aba: string, mensagem: Mensagem | null): void {
        this.mensagem = mensagem;

        this.formLogin = {} as LoginInput;
        this.errosFormLogin = {};
        this.tentouLogar = false;
        this.logando = false;

        this.formCadastro = {} as UsuarioCreateRequest;
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
                    this._autenticacaoService.removerSessionLogin();
                    const mensagem = {
                        tipo: TipoMensagem.SUCESSO,
                        texto: `Logout efetuado com sucesso.`
                    } as Mensagem;
                    this.selecionarAba('login-usuario', mensagem)
                    this.deslogando = false;
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
                this.mensagem = {
                    tipo: TipoMensagem.ERRO,
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível fazer login. Confira os dados e tente novamente.'
                    )
                };
                this.logando = false;
            }
        });
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
        } as UsuarioCreateRequest;
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
                    tipo: TipoMensagem.SUCESSO,
                    texto: `Usuario ${response.nome} cadastrado com sucesso. Faça login para continuar.`
                } as Mensagem;
                this.selecionarAba('login-usuario', mensagem);
            },
            error: (erro) => {
                this.mensagem = {
                    tipo: TipoMensagem.ERRO,
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível cadastrar. Confira os dados e tente novamente.'
                    )
                };
                this.cadastrando = false;
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

        const erroEmail = validarEmailUsuario(f.email);
        if(erroEmail) {
            erros.email = erroEmail;
        };
        const erroSenha = validarSenhaUsuario(f.senha);
        if(erroSenha) {
            erros.senha = erroSenha;
        };

        this.errosFormLogin = erros;
        return Object.keys(erros).length === 0;
    }

    revalidarCadastro(): void {
        if (this.tentouCadastrar) {
            this._validarCadastro();
        }
    }

    private _validarCadastro(): boolean {
        const f = this.formCadastro;
        const erros: ErrosFormCadastro = {};

        console.log(this.formCadastro, f)

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
}
