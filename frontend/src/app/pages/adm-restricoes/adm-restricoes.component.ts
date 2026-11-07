import { ChangeDetectorRef, Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Restricao {
    id: Number;
    rota_id: Number;
    janela_inicio?: String;
    janela_fim?: String;
    capacidade_maxima?: Number;
    unidade_capacidade?: String;
    observacoes?: String
    criada_em: String;
    atualizada_em: String;
}

interface Rota {
    id: Number;
    nome: String;
}

@Component({
    selector: 'app-adm-restricoes',
    imports: [HeaderComponent, CommonModule, FormsModule],
    templateUrl: './adm-restricoes.component.html',
    styleUrl: './adm-restricoes.component.css'
})
export class AdmRestricoesComponent {

    public restricoes: Array<Restricao> = [
        {
            id: 0,
            rota_id: 0,
            janela_inicio: new Date().toLocaleTimeString('pt-BR'),
            janela_fim: undefined,
            capacidade_maxima: 13.5,
            unidade_capacidade: 'Toneladas',
            observacoes: '13.5 Toneladas de açúcar, tô com fome.',
            criada_em: new Date().toLocaleDateString('pt-BR'),
            atualizada_em: new Date().toLocaleDateString('pt-BR')
        },
        {
            id: 1,
            rota_id: 0,
            janela_inicio: new Date().toLocaleTimeString('pt-BR'),
            janela_fim: new Date().toLocaleTimeString('pt-BR'),
            capacidade_maxima: 13.5,
            unidade_capacidade: 'Toneladas',
            observacoes: 'Mais 13.5 Toneladas de açúcar, minha esposa também está.',
            criada_em: new Date().toLocaleDateString('pt-BR'),
            atualizada_em: new Date().toLocaleDateString('pt-BR')
        },
        {
            id: 2,
            rota_id: 1,
            janela_inicio: new Date().toLocaleTimeString('pt-BR'),
            janela_fim: new Date().toLocaleTimeString('pt-BR'),
            capacidade_maxima: 30,
            unidade_capacidade: 'Kilolitros',
            observacoes: '30 Kilolitros de água, deu sede.',
            criada_em: new Date().toLocaleDateString('pt-BR'),
            atualizada_em: new Date().toLocaleDateString('pt-BR')
        }
    ];

    public rotas: Array<Rota> = [
        {
            id: 0,
            nome: 'Casas Bahia'
        },
        {
            id: 3,
            nome: 'Ilha'
        },
        {
            id: 4,
            nome: 'Lago'
        },
        {
            id: 5,
            nome: 'Carro'
        },
        {
            id: 6,
            nome: 'OAKSNFPS'
        },
    ];

    public abaAtiva: String = "Listar"

    public novaRestricaoRotaId!: Number;
    public novaRestricaoJanelaInicio!: String;
    public novaRestricaoJanelaFim!: String;
    public novaRestricaoCapacidadeMaxima!: Number;
    public novaRestricaoUnidadeCapacidade!: String;
    public novaRestricaoObservacoes!: String;

    public restricaoDetalhada: Restricao = {} as Restricao;
    public restricaoEditada: Restricao = {} as Restricao;
    
    cadastrarRestricao(): void{
        console.log('aaaa');
        this.abrirLista();
    }
    
    editarRestricao(): void{
        console.log('bbbb');
        this.abrirLista();
    }

    abrirCadastro(): void {
        this.abaAtiva = 'Cadastrar';
    }
    
    abrirLista(): void {
        this.abaAtiva = 'Listar'
    }

    abrirDetalhes(id: Number): void {
        this.restricaoDetalhada = this.restricoes.find((restricao) =>
            restricao.id === id
        ) || {} as Restricao;

        if(this.restricaoDetalhada.id != null){
            this.abaAtiva = 'Detalhar';
        } else {
            console.log('Erro');
        }
    }

    abrirEdicao(id: Number): void {
        this.restricaoEditada = this.restricoes.find((restricao) =>
            restricao.id === id
        ) || {} as Restricao;

        if (this.restricaoEditada.id != null) {
            this.abaAtiva = 'Editar';
        } else {
            console.log('Erro');
        }
    }

}
