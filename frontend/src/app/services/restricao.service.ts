import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { atualizarRestricaoInput, cadastrarRestricaoInput } from '../models/restricaoService.model';
import { Restricao } from '../models/restricao.model';
import { API_URL } from '../config/api.config';

@Injectable({
  providedIn: 'root'
})
export class RestricaoService {

    constructor(
        private _http: HttpClient
    ) {}

    public obterRestricoes(): Observable<Array<Restricao>> {
        return of([
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
                },
                {
                    id: 3,
                    rota_id: 5,
                    janela_inicio: new Date().toLocaleTimeString('pt-BR'),
                    janela_fim: new Date().toLocaleTimeString('pt-BR'),
                    capacidade_maxima: 51,
                    unidade_capacidade: 'pés',
                    observacoes: 'pedal',
                    criada_em: new Date().toLocaleDateString('pt-BR'),
                    atualizada_em: new Date().toLocaleDateString('pt-BR')
                }
            ]);
        return this._http.get<Array<Restricao>>(API_URL + '/restricoes');
    }

    public cadastrarRestricao(input: cadastrarRestricaoInput): Observable<Restricao> {
        return of({
                    id: Math.floor(Math.random() * 20000),
                    rota_id: input.rota_id,
                    janela_inicio: input.janela_inicio,
                    janela_fim: input.janela_fim,
                    capacidade_maxima: input.capacidade_maxima,
                    unidade_capacidade: input.unidade_capacidade,
                    observacoes: input.observacoes,
                    criada_em: new Date().toLocaleDateString('pt-BR'),
                    atualizada_em: new Date().toLocaleDateString('pt-BR')
                })
        return this._http.post<Restricao>(API_URL + '/restricoes', input);
    }

    public atualizarRestricao(input: atualizarRestricaoInput): Observable<Restricao> {
        console.log('service', input);
        return of({
                    id: input.id,
                    rota_id: 4,
                    janela_inicio: input.janela_inicio,
                    janela_fim: input.janela_fim,
                    capacidade_maxima: input.capacidade_maxima,
                    unidade_capacidade: input.unidade_capacidade,
                    observacoes: input.observacoes,
                    criada_em: new Date().toLocaleDateString('pt-BR'),
                    atualizada_em: new Date().toLocaleDateString('pt-BR')
                });
        return this._http.put<Restricao>(API_URL + '/restricoes/' + input.id, input);
    }

    public deletarRestricao(input: Number): Observable<Number> {
        return of(input);
        return this._http.delete<Number>(API_URL + '/restricoes/' + input);
    }
}