
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { PainelAdmComponent } from './painel-adm.component';
import { UsuarioService } from '../../services/usuario.service';
import { Perfil, Usuario, UsuarioCreateRequest, UsuarioUpdateRequest } from '../../models/usuario.model';
import { TipoMensagem } from '../../models/mensagem.model';

describe('PainelAdmComponent', () => {
    let component: PainelAdmComponent;
    let fixture: ComponentFixture<PainelAdmComponent>;

    let usuarioServiceMock: jasmine.SpyObj<UsuarioService>;
    let usuarioMock1: Usuario;
    let usuarioMock2: Usuario;
    let usuarioMock3: Usuario;
    let cadastroUsuarioMock: UsuarioCreateRequest;
    let edicaoUsuarioMock: UsuarioUpdateRequest;

    function criarMocks(): void {
        usuarioMock1 = {
            id: 1,
            nome: 'Vitor',
            email: 'vitor@gmail.com',
            ativo: true,
            perfil: Perfil.ADM,
            criado_em: new Date('2026-11-20')
        }

        usuarioMock2 = {
            id: 2,
            nome: 'Ricardo',
            email: 'ricardo@gmail.com',
            ativo: true,
            perfil: Perfil.USUARIO,
            criado_em: new Date('2026-11-22')
        }

        usuarioMock3 = {
            id: 3,
            nome: 'Moretti',
            email: 'moretti@gmail.com',
            ativo: true,
            perfil: Perfil.USUARIO,
            criado_em: new Date('2026-11-25')
        }

        cadastroUsuarioMock = {
            nome: 'Moretti',
            email: 'moretti@gmail.com',
            senha: '12341234',
            telefone: '(61) 99424-2871'
        }

        edicaoUsuarioMock ={
            nome: 'Moretti',
            email: 'moretti@gmail.com',
            telefone: '(61) 99424-2871',
            perfil: Perfil.USUARIO,
            ativo: true
        }
    }

    beforeEach(async () => {
        criarMocks();

        usuarioServiceMock = jasmine.createSpyObj<UsuarioService>(
            'UsuarioService',
            ['listarUsuarios', 'obterUsuario', 'cadastrarUsuario', 'atualizarUsuario', 'excluirUsuario']
        );
        
        usuarioServiceMock.listarUsuarios.and.returnValue(
            of([usuarioMock1, usuarioMock2])
        );
    
        usuarioServiceMock.cadastrarUsuario.and.returnValue(
            of(usuarioMock3)
        );

        await TestBed.configureTestingModule({
        imports: [PainelAdmComponent],
        providers: [
            {
                provide: UsuarioService,
                useValue: usuarioServiceMock
            }
        ]
        })
            .overrideComponent(PainelAdmComponent, {
                set: { template: '' }
            })
            .compileComponents();

        fixture = TestBed.createComponent(
            PainelAdmComponent
        );
        
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('deve criar o painel ADM', () => {
        expect(component).toBeTruthy();
    });

    describe('ListarUsuarios', () => {
        it('deve listar os usuarios ao iniciar', () => {
            const spyAtualizarLista = spyOn(component, 'atualizarListaUsuarios');

            component.ngOnInit();

            expect(spyAtualizarLista).toHaveBeenCalledTimes(1);
            expect(usuarioServiceMock.listarUsuarios)
                .toHaveBeenCalledTimes(1);
            expect(component.usuarios)
                .toEqual([
                    usuarioMock1,
                    usuarioMock2
                ]);
            expect(component.abaAtiva)
                .toEqual('listar-usuario');
        });

        it('deve limpar o erro da lista quando tentar listar', () => {
            component.erroLista = 'Erro'

            component.atualizarListaUsuarios();

            expect(usuarioServiceMock.listarUsuarios)
                .toHaveBeenCalled();
            expect(component.erroLista).toEqual('');
        });

        it('deve alterar erroLista quando der erro', () => {
            usuarioServiceMock.listarUsuarios.and.returnValue(
                throwError(() => ({
                    error: { detail: 'Erro ao tentar listar' }
                }))
            );

            component.atualizarListaUsuarios();

            expect(component.erroLista)
                .toEqual(
                    'Erro ao tentar listar'
                );
        });

        it('deve alterar erroLista para a default quando der erro e não retornar mensagem', () => {
            usuarioServiceMock.listarUsuarios.and.returnValue(
                throwError(() => ({}))
            );

            component.atualizarListaUsuarios();

            expect(component.erroLista)
                .toEqual(
                    'Não foi possível carregar os usuários. Tente novamente mais tarde.'
                );
        });

        it('deve mandar erro de conexão quando não conseguir conectar', () => {
            usuarioServiceMock.listarUsuarios.and.returnValue(
                throwError(() => ({
                    status: 0
                }))
            );

            component.atualizarListaUsuarios();

            expect(component.erroLista)
                .toEqual(
                    'Não foi possível falar com o servidor. Confira se a API está rodando e tente de novo.'
                );
        });
    })

    describe('CadastrarUsuario', () => {
        it('deve cadastrar usuario', () => {
            component.formCadastro = cadastroUsuarioMock;

            component.cadastrarUsuario();

            expect(usuarioServiceMock.cadastrarUsuario)
                .toHaveBeenCalledWith({
                    nome: 'Moretti',
                    email: 'moretti@gmail.com',
                    senha: '12341234',
                    telefone: '(61) 99424-2871'
                });
            expect(component.mensagem).toEqual({
                tipo: TipoMensagem.SUCESSO,
                texto: 'Usuário Moretti cadastrado com sucesso.'
            })
            expect(component.usuarios)
                .toEqual([
                    usuarioMock1,
                    usuarioMock2,
                    usuarioMock3
                ]);
        });

        it('deve retornar para a listagem de usuarios ao cadastrar com sucesso', () => {
            component.cadastrando = false;
            const spyAlterarAba = spyOn(component, 'selecionarAba').and.callThrough();
            const mensagem = {
                tipo: TipoMensagem.SUCESSO,
                texto: 'Usuário Moretti cadastrado com sucesso.'
            }
            component.formCadastro = cadastroUsuarioMock;

            component.cadastrarUsuario();

            expect(usuarioServiceMock.cadastrarUsuario)
                .toHaveBeenCalled();
            expect(spyAlterarAba)
                .toHaveBeenCalledWith('listar-usuario', mensagem);
            expect(component.mensagem).toEqual(mensagem);
        });

        it('não deve cadastrar quando o sistema estiver tentando cadastrar', () => {
            component.cadastrando = true;
            component.formCadastro = cadastroUsuarioMock;

            component.cadastrarUsuario();

            expect(usuarioServiceMock.cadastrarUsuario)
                .toHaveBeenCalledTimes(0);
        });

        it('deve cadastrar sem telefone', () => {
            component.formCadastro = cadastroUsuarioMock;
            component.formCadastro.telefone = null;

            component.cadastrarUsuario();

            expect(usuarioServiceMock.cadastrarUsuario)
                .toHaveBeenCalledWith({
                    nome: 'Moretti',
                    email: 'moretti@gmail.com',
                    senha: '12341234'
                });
            expect(component.usuarios)
                .toEqual([
                    usuarioMock1,
                    usuarioMock2,
                    usuarioMock3
                ]);
        });

        it('deve aceitar string vazia como sem telefone', () => {
            component.formCadastro = cadastroUsuarioMock;
            component.formCadastro.telefone = '';

            component.cadastrarUsuario();

            expect(usuarioServiceMock.cadastrarUsuario)
                .toHaveBeenCalledWith({
                    nome: 'Moretti',
                    email: 'moretti@gmail.com',
                    senha: '12341234'
                });
            expect(component.usuarios)
                .toEqual([
                    usuarioMock1,
                    usuarioMock2,
                    usuarioMock3
                ]);
        });

        it('deve retornar erros de formulário quando não preencher os campos', () => {
            component.formCadastro = {} as UsuarioCreateRequest;

            component.cadastrarUsuario();

            expect(component.errosFormCadastro).toEqual({
                nome: 'Digite um nome.',
                email: 'Digite um e-mail.',
                senha: 'Digite uma senha.'
            })
            expect(usuarioServiceMock.cadastrarUsuario)
                .toHaveBeenCalledTimes(0);
            expect(component.usuarios).toEqual([
                usuarioMock1,
                usuarioMock2
            ]);
        });

        it('deve retornar erro quando nome é menor que 4 caracteres', () => {
            component.formCadastro = cadastroUsuarioMock;
            component.formCadastro.nome = 'Ela';

            component.cadastrarUsuario();

            expect(component.errosFormCadastro).toEqual({
                nome: 'Nome deve conter ao menos 4 caracteres.',
            })
            expect(usuarioServiceMock.cadastrarUsuario)
                .toHaveBeenCalledTimes(0);
            expect(component.usuarios).toEqual([
                usuarioMock1,
                usuarioMock2
            ]);
        });

        it('deve retornar erro quando email não estiver no formato correto', () => {
            component.formCadastro = cadastroUsuarioMock;
            component.formCadastro.email = 'emal@';

            component.cadastrarUsuario();

            expect(component.errosFormCadastro).toEqual({
                email: 'Email deve seguir o formato: "fulano@gmail.com".',
            })
            expect(usuarioServiceMock.cadastrarUsuario)
                .toHaveBeenCalledTimes(0);
            expect(component.usuarios).toEqual([
                usuarioMock1,
                usuarioMock2
            ]);
        });

        it('deve retornar erro quando senha for menor que 8 caracteres', () => {
            component.formCadastro = cadastroUsuarioMock;
            component.formCadastro.senha = '123123';

            component.cadastrarUsuario();

            expect(component.errosFormCadastro).toEqual({
                senha: 'Senha deve ter ao menos 8 caracteres.'
            })
            expect(usuarioServiceMock.cadastrarUsuario)
                .toHaveBeenCalledTimes(0);
            expect(component.usuarios).toEqual([
                usuarioMock1,
                usuarioMock2
            ]);
        });

        it('deve retornar erro quando telefone não estiver no formato correto', () => {
            component.formCadastro = cadastroUsuarioMock;
            component.formCadastro.telefone = '123123';

            component.cadastrarUsuario();

            expect(component.errosFormCadastro).toEqual({
                telefone: 'Telefone deve seguir o formato: "(61) 99876-5432".'
            })
            expect(usuarioServiceMock.cadastrarUsuario)
                .toHaveBeenCalledTimes(0);
            expect(component.usuarios).toEqual([
                usuarioMock1,
                usuarioMock2
            ]);
        });

        it('deve alterar mensagem quando der erro no cadastro', () => {
            component.formCadastro = cadastroUsuarioMock;

            usuarioServiceMock.cadastrarUsuario.and.returnValue(
                throwError(() => ({
                    error: { detail: 'Erro ao tentar cadastrar' }
                }))
            );

            component.cadastrarUsuario();

            expect(component.mensagem).toEqual({
                tipo: TipoMensagem.ERRO,
                texto: 'Erro ao tentar cadastrar'
            })
        });

        it('deve alterar mensagem para a default quando der erro no cadastro e não retornar mensagem', () => {
            component.formCadastro = cadastroUsuarioMock;

            usuarioServiceMock.cadastrarUsuario.and.returnValue(
                throwError(() => ({}))
            );

            component.cadastrarUsuario();

            expect(component.mensagem).toEqual({
                tipo: TipoMensagem.ERRO,
                texto: 'Não foi possível cadastrar o usuário. Confira os dados e tente novamente.'
            })
        });

        it('deve mandar erro de conexão quando não conseguir conectar', () => {
            component.formCadastro = cadastroUsuarioMock;

            usuarioServiceMock.cadastrarUsuario.and.returnValue(
                throwError(() => ({
                    status: 0
                }))
            );

            component.cadastrarUsuario();

            expect(component.mensagem).toEqual({
                tipo: TipoMensagem.ERRO,
                texto: 'Não foi possível falar com o servidor. Confira se a API está rodando e tente de novo.'
            })
        });

        it('deve limpar mensagem quando revalidaro cadastro', () => {
            component.mensagem = {
                tipo: TipoMensagem.ERRO,
                texto: 'Erro aleatório'
            }
            
            component.revalidarCadastro();
            
            expect(component.mensagem).toBeNull()
        });

        it('nao deve validar o formulario de cadastro até o usuario tentar cadastrar', () => {
            component.tentouCadastrar = false;
            component.errosFormCadastro = {
                nome: 'Erro'
            }
            
            component.revalidarCadastro();
            
            expect(component.errosFormCadastro).toEqual({
                nome: 'Erro'
            })
        });

        it('deve validar o formulario de cadastro depois que o usuario tentar cadastrar', () => {
            component.tentouCadastrar = true;
            component.formCadastro = cadastroUsuarioMock;
            component.errosFormCadastro = {
                nome: 'Erro'
            }
            
            component.revalidarCadastro();
            
            expect(component.errosFormCadastro).toEqual({
            })
        });
    })

    describe('DetalharUsuario', () => {
        it('deve preencher os valores do usuario e selecionar a aba do detalhamento quando abrir a tela de detalhes', () => {
            spyOn(component, 'selecionarAba').and.callThrough;
            expect(component.usuarioDetalhado).toEqual({} as Usuario);

            component.abrirDetalhes(usuarioMock1);

            expect(component.usuarioDetalhado).toEqual(usuarioMock1);
            expect(component.selecionarAba).toHaveBeenCalledWith('detalhar-usuario', null);
        })

        it('deve limpar a mensagem quando abrir a tela de detalhes', () => {
            component.mensagem = {
                tipo: TipoMensagem.ERRO,
                texto: 'ERRO'
            };

            component.abrirDetalhes(usuarioMock1);

            expect(component.usuarioDetalhado).toEqual(usuarioMock1);
            expect(component.mensagem).toBeNull();
        })
    })

    describe('EditarUsuario', () => {
        it('deve preencher os valores, limpar campos de tratamento de tela e selecionar a aba de edição quando abrir a tela de edição', () => {
            spyOn(component, 'selecionarAba').and.callThrough;
            expect(component.usuarioEditado).toEqual({} as Usuario);

            component.abrirEdicao(usuarioMock1);

            expect(component.tentouEditar).toEqual(false);
            expect(component.editando).toEqual(false);
            expect(component.errosFormEdicao).toEqual({});
            expect(component.usuarioEditado).toEqual(usuarioMock1);
            expect(component.formEdicao).toEqual({
                nome: usuarioMock1.nome,
                email: usuarioMock1.email,
                perfil: usuarioMock1.perfil,
                telefone: usuarioMock1.telefone,
                ativo: usuarioMock1.ativo
            } as UsuarioUpdateRequest);
            expect(component.selecionarAba).toHaveBeenCalledWith('editar-usuario', null);
        })

        it('deve limpar a mensagem quando abrir a tela de edição', () => {
            component.mensagem = {
                tipo: TipoMensagem.ERRO,
                texto: 'ERRO'
            };

            component.abrirEdicao(usuarioMock1);

            expect(component.usuarioEditado).toEqual(usuarioMock1);
            expect(component.mensagem).toBeNull();
        })

        it('deve retornar erros de formulário quando alterar os campos para vazio', () => {
            component.formEdicao = {} as UsuarioUpdateRequest;

            component.atualizarUsuario();

            expect(component.errosFormEdicao).toEqual({
                nome: 'Digite um nome.',
                email: 'Digite um e-mail.',
            })
            expect(usuarioServiceMock.atualizarUsuario)
                .toHaveBeenCalledTimes(0);
            expect(component.usuarios).toEqual([
                usuarioMock1,
                usuarioMock2
            ]);
        });

        it('deve retornar erro quando nome é menor que 4 caracteres', () => {
            component.formEdicao = edicaoUsuarioMock;
            component.formEdicao.nome = 'Ela';

            component.atualizarUsuario();

            expect(component.errosFormEdicao).toEqual({
                nome: 'Nome deve conter ao menos 4 caracteres.',
            })
            expect(usuarioServiceMock.atualizarUsuario)
                .toHaveBeenCalledTimes(0);
            expect(component.usuarios).toEqual([
                usuarioMock1,
                usuarioMock2
            ]);
        });

        it('deve retornar erro quando email não estiver no formato correto', () => {
            component.formEdicao = edicaoUsuarioMock;
            component.formEdicao.email = 'emal@';

            component.atualizarUsuario();

            expect(component.errosFormEdicao).toEqual({
                email: 'Email deve seguir o formato: "fulano@gmail.com".',
            })
            expect(usuarioServiceMock.atualizarUsuario)
                .toHaveBeenCalledTimes(0);
            expect(component.usuarios).toEqual([
                usuarioMock1,
                usuarioMock2
            ]);
        });

        it('deve retornar erro quando telefone não estiver no formato correto', () => {
            component.formEdicao = edicaoUsuarioMock;
            component.formEdicao.telefone = '123123';

            component.atualizarUsuario();

            expect(component.errosFormEdicao).toEqual({
                telefone: 'Telefone deve seguir o formato: "(61) 99876-5432".'
            })
            expect(usuarioServiceMock.atualizarUsuario)
                .toHaveBeenCalledTimes(0);
            expect(component.usuarios).toEqual([
                usuarioMock1,
                usuarioMock2
            ]);
        });

        it('deve alterar mensagem quando der erro na edição', () => {
            component.formEdicao = edicaoUsuarioMock;

            usuarioServiceMock.atualizarUsuario.and.returnValue(
                throwError(() => ({
                    error: { detail: 'Erro ao tentar atualizar' }
                }))
            );

            component.atualizarUsuario();

            expect(component.mensagem).toEqual({
                tipo: TipoMensagem.ERRO,
                texto: 'Erro ao tentar atualizar'
            })
        });

        it('deve alterar mensagem para a default quando der erro na edição e não retornar mensagem', () => {
            component.formEdicao = edicaoUsuarioMock;

            usuarioServiceMock.atualizarUsuario.and.returnValue(
                throwError(() => ({}))
            );

            component.atualizarUsuario();

            expect(component.mensagem).toEqual({
                tipo: TipoMensagem.ERRO,
                texto: 'Não foi possível atualizar o usuário. Tente novamente mais tarde.'
            })
        });

        it('deve mandar erro de conexão quando não conseguir conectar', () => {
            component.formEdicao = edicaoUsuarioMock;

            usuarioServiceMock.atualizarUsuario.and.returnValue(
                throwError(() => ({
                    status: 0
                }))
            );

            component.atualizarUsuario();

            expect(component.mensagem).toEqual({
                tipo: TipoMensagem.ERRO,
                texto: 'Não foi possível falar com o servidor. Confira se a API está rodando e tente de novo.'
            })
        });

        it('deve limpar mensagem quando revalidar a edição', () => {
            component.mensagem = {
                tipo: TipoMensagem.ERRO,
                texto: 'Erro aleatório'
            }
            
            component.revalidarEdicao();
            
            expect(component.mensagem).toBeNull()
        });

        it('nao deve validar o formulario de edição até o usuario tentar confirmar a edição', () => {
            component.tentouEditar = false;
            component.errosFormEdicao = {
                nome: 'Erro'
            }
            
            component.revalidarEdicao();
            
            expect(component.errosFormEdicao).toEqual({
                nome: 'Erro'
            })
        });

        it('deve validar o formulario de edição depois que o usuario tentar editar', () => {
            component.tentouEditar = true;
            component.formEdicao = edicaoUsuarioMock;
            component.errosFormEdicao = {
            }
            
            component.revalidarEdicao();
            
            expect(component.errosFormEdicao).toEqual({})
        });

        it('não deve atualizar o usuário e gerar mensagem de erro quando não tiver mudanças de dados', () => {
            component.abrirEdicao(usuarioMock1);
            
            component.atualizarUsuario();
            
            expect(usuarioServiceMock.atualizarUsuario).toHaveBeenCalledTimes(0);
            expect(component.mensagem).toEqual({
                tipo: TipoMensagem.ERRO,
                texto: 'Nenhuma mudança a ser efetivada.'
            })
        });

        it('deve atualizar o usuário', () => {
            const usuarioAtualizado: Usuario = {
                id: 2,
                nome: 'Ricardos',
                email: 'ric@gmail.com',
                ativo: true,
                perfil: Perfil.ADM,
                criado_em: new Date('2026-11-22')
            }
            usuarioServiceMock.atualizarUsuario.and.returnValue(of(usuarioAtualizado));
            usuarioServiceMock.listarUsuarios.and.returnValue(of([usuarioMock1, usuarioAtualizado]));
            spyOn(component, 'atualizarUsuario').and.callThrough();

            component.abrirEdicao(usuarioMock2);

            component.formEdicao.nome = 'Ricardos';
            component.formEdicao.email = "ric@gmail.com";
            component.formEdicao.perfil = Perfil.ADM;

            console.log('formEdicao> ', component.formEdicao);

            component.atualizarUsuario();
            
            expect(usuarioServiceMock.atualizarUsuario).toHaveBeenCalledWith(
                usuarioMock2.id,
                {
                    nome: "Ricardos",
                    email: "ric@gmail.com",
                    perfil: Perfil.ADM 
                }
            );
            expect(component.mensagem).toEqual({
                tipo: TipoMensagem.SUCESSO,
                texto: 'Usuário Ricardos atualizado com sucesso.'
            })
            expect(component.usuarios).toEqual([
                usuarioMock1,
                usuarioAtualizado
            ])
        });
    })
    
});