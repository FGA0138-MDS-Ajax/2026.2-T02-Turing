import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Restricao } from '../../models/restricao.model';
import { Rota, Status } from '../../models/rota.model';
import { ListarRestricoes } from './models/ListarRestricoes';
import { RestricaoService } from '../../services/restricao.service';
import { atualizarRestricaoInput, cadastrarRestricaoInput } from '../../models/restricaoService.model';
import { Subject, takeUntil } from 'rxjs';
import { RotaService } from '../../services/rota.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { mensagemDeErro } from '../../shared/erro.util';

type Aba = 'listar-restricao' | 'cadastrar-restricao' | 'detalhar-restricao' | 'editar-restricao';

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
        //{ id: 'listar-restricao', rotulo: 'Usuários' },
        //{ id: 'listar-restricao', rotulo: 'Alertas' },
        { id: 'listar-restricao', rotulo: 'Restrições' }
    ];

  get abaDestaque(): string {
    if(
        this.abaAtiva === 'listar-restricao' ||
        this.abaAtiva === 'cadastrar-restricao' ||
        this.abaAtiva === 'editar-restricao' ||
        this.abaAtiva === 'detalhar-restricao'
    ) {
        return 'listar-restricao';
    }
    return '';
  }

    public restricoes: Array<ListarRestricoes> = [];

    public rotas: Array<Rota> = [];

    public abaAtiva: Aba = 'listar-restricao';
    public erroLista: String = '';
    public mensagem: Mensagem | null = null;
    public carregando: Boolean = false;
    public cadastrando: Boolean = false;
    public editando: Boolean = false;
    public deletando: Boolean = false;

    public restricaoNovaRotaId?: String;
    public restricaoNova: ListarRestricoes = {} as ListarRestricoes;
    public restricaoDetalhada: ListarRestricoes = {} as ListarRestricoes;
    public restricaoEditada: ListarRestricoes = {} as ListarRestricoes;

    private readonly _destroy$ = new Subject<void>();

    constructor(
        private _cdr: ChangeDetectorRef,
        private _restricaoService: RestricaoService,
        private _rotaService: RotaService
    ){}

    ngOnInit(){
        this.obterRotas();
        this.atualizarListaRestricoes();
    }

    atualizarListaRestricoes(): void {
        this.carregando = true;
        this.obterRestricoes();
        this.aplicarNomesDasRotas(this.restricoes);
        this._cdr.detectChanges();
    };

    selecionarAba(aba: string): void {
        this.abaAtiva = aba as Aba;
        this.mensagem = null;
    }

    aplicarNomesDasRotas(input: Array<Restricao> | Array<ListarRestricoes>): Array<ListarRestricoes> {
        this.carregando = true;
        const temp: Array<ListarRestricoes> = input;
        temp.forEach((restricao) => {
            restricao.nome_rota = this.rotas.find((rota) => rota.id === restricao.rota_id)?.nome;
        });
        this.carregando = false;
        return temp;
    }

    aplicarNomeDaRota(input: Restricao): ListarRestricoes {
        this.carregando = true;
        const temp: ListarRestricoes = input;
        temp.nome_rota = this.rotas.find((rota) => rota.id === temp.rota_id)?.nome;
        this.carregando = false;
        return temp;
    }

    obterRotas(): void {
        this.rotas = [
            {
                id: 0,
                nome: 'Casas Bahia',
                motorista_id: 0,
                data_execucao: new Date().toLocaleDateString('pt-BR'),
                status: Status.EM_ANDAMENTO,
                criada_em: new Date().toLocaleDateString('pt-BR'),
                atualizada_em: new Date().toLocaleDateString('pt-BR')
            },
            {
                id: 1,
                nome: 'Ilha',
                motorista_id: 0,
                data_execucao: new Date().toLocaleDateString('pt-BR'),
                status: Status.EM_ANDAMENTO,
                criada_em: new Date().toLocaleDateString('pt-BR'),
                atualizada_em: new Date().toLocaleDateString('pt-BR')
            },
            {
                id: 4,
                nome: 'Lago',
                motorista_id: 0,
                data_execucao: new Date().toLocaleDateString('pt-BR'),
                status: Status.EM_ANDAMENTO,
                criada_em: new Date().toLocaleDateString('pt-BR'),
                atualizada_em: new Date().toLocaleDateString('pt-BR')
            },
            {
                id: 5,
                nome: 'Carro',
                motorista_id: 0,
                data_execucao: new Date().toLocaleDateString('pt-BR'),
                status: Status.EM_ANDAMENTO,
                criada_em: new Date().toLocaleDateString('pt-BR'),
                atualizada_em: new Date().toLocaleDateString('pt-BR')
            },
            {
                id: 6,
                nome: 'OAKSNFPS',
                motorista_id: 0,
                data_execucao: new Date().toLocaleDateString('pt-BR'),
                status: Status.EM_ANDAMENTO,
                criada_em: new Date().toLocaleDateString('pt-BR'),
                atualizada_em: new Date().toLocaleDateString('pt-BR')
            },
        ];
        /*this._rotaService.obterPedidos().pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Array<Rota>) => {
                console.log(response);
                this.rotas = response;
            }
        })*/
    }

    obterRestricoes(): void {
        this.carregando = true;
        this.erroLista = '';

        this._restricaoService.obterRestricoes().pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Array<Restricao>) => {
                this.carregando = false;
                this.restricoes = response;
            },
            error: (erro) => {
                this.carregando = false;
                this.erroLista = mensagemDeErro(erro, 'Não foi possível carregar os pedidos.');
            }
        });
    }
    
    cadastrarRestricao(): void {
        const restricaoNovaRotaIdValue = Number(this.restricaoNovaRotaId);

        if(restricaoNovaRotaIdValue) {
            const input: cadastrarRestricaoInput = {
                rota_id: restricaoNovaRotaIdValue,
                janela_fim: this.restricaoNova.janela_fim,
                janela_inicio: this.restricaoNova.janela_inicio,
                capacidade_maxima: this.restricaoNova.capacidade_maxima,
                unidade_capacidade: this.restricaoNova.unidade_capacidade,
                observacoes: this.restricaoNova.observacoes
            };

            this._restricaoService.cadastrarRestricao(
                input
            ).subscribe({
                next: (response: Restricao) => {
                    const restr: ListarRestricoes = this.aplicarNomeDaRota(response);
                    this.restricoes.push(restr);
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
        } else {
            console.log('Erro');
        }
    }
    
    editarRestricao(): void {
        this.editando = true;

        const input: atualizarRestricaoInput = {
            id: this.restricaoEditada.id,
            capacidade_maxima: this.restricaoEditada.capacidade_maxima,
            unidade_capacidade: this.restricaoEditada.unidade_capacidade,
            janela_inicio: this.restricaoEditada.janela_inicio,
            janela_fim: this.restricaoEditada.janela_fim,
            observacoes: this.restricaoEditada.observacoes
        }

        this._restricaoService.atualizarRestricao(
            input
        ).pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Restricao) => {
                const restr: ListarRestricoes = this.aplicarNomeDaRota(response);
                const idRestr = this.restricoes.findIndex((restri) =>
                    restri.id === restr.id
                );
                this.restricoes[idRestr] = restr;
                this.editando = false;
                this.abrirLista();
            },
            error: (erro) => {
                this.editando = false;
                this.mensagem = {
                    tipo: 'erro',
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível editar. Tente novamente mais tarde.'
                    )
                };
            }
        });

    }

    excluirRestricao(): void {
        this.editando = true;

        this._restricaoService.deletarRestricao(
            this.restricaoEditada.id
        ).pipe(
            takeUntil(this._destroy$)
        ).subscribe({
            next: (response: Number) => {
                const idRestr = this.restricoes.findIndex((restri) =>
                    restri.id === response
                );
                this.restricoes.splice(idRestr, 1);
                this.editando = false;
                this.abrirLista();
            },
            error: (erro) => {
                this.editando = false;
                this.mensagem = {
                    tipo: 'erro',
                    texto: mensagemDeErro(
                        erro,
                        'Não foi possível editar. Tente novamente mais tarde.'
                    )
                };
            }
        });
    }
    
    abrirLista(): void {
        this._cdr.detectChanges();

        this.restricaoNovaRotaId = undefined ;
        this.restricaoNova = {} as ListarRestricoes;
        this.restricaoDetalhada = {} as ListarRestricoes;
        this.restricaoEditada = {} as ListarRestricoes;
        
        this.selecionarAba('listar-restricao');
    }

    abrirDetalhes(restr: ListarRestricoes): void {
        this.restricaoDetalhada = restr;
        this.selecionarAba('detalhar-restricao');
    }

    abrirEdicao(restr: ListarRestricoes): void {
        this.restricaoEditada = restr;
        this.selecionarAba('editar-restricao');
    }

}
