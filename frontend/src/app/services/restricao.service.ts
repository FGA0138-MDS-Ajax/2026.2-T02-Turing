import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
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
        return this._http.get<Array<Restricao>>(API_URL + '/restricoes');
    }

    public cadastrarRestricao(input: cadastrarRestricaoInput): Observable<Restricao> {
        return this._http.post<Restricao>(API_URL + '/restricoes', input);
    }

    public atualizarRestricao(input: atualizarRestricaoInput): Observable<Restricao> {
        return this._http.put<Restricao>(API_URL + '/restricoes/' + input.id, input);
    }

    public deletarRestricao(input: Number): Observable<HttpResponse<any>> {
        return this._http.delete<HttpResponse<any>>(API_URL + '/restricoes/' + input, {observe: 'response'});
    }
}