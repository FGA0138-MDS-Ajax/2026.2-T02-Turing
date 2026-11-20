import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Destino, DestinoCreateRequest, DestinoUpdateRequest } from '../models/destino.model';

@Injectable({
  providedIn: 'root'
})
export class DestinoService {
    private readonly apiUrl = API_URL;

    constructor(
        private _http: HttpClient
    ) {}

    //lista todos os destinos do usuario logado
    public listarDestinos(): Observable<Array<Destino>> {
        return this._http.get<Array<Destino>>(`${this.apiUrl}/destinos`);
    }

    //lista um destino
    public cadastrarDestino(input: DestinoCreateRequest): Observable<Destino> {
        return this._http.post<Destino>(`${this.apiUrl}/destinos`, input);
    }

    //atualiza os dados de um destino
    public atualizarDestino(destinoId: number, dadosDestino: DestinoUpdateRequest): Observable<Destino> {
        return this._http.put<Destino>(`${this.apiUrl}/destinos/${destinoId}`, dadosDestino);
    }

    //deleta um destino
    public deletarDestino(destinoId: number): Observable<HttpResponse<any>> {
        return this._http.delete<HttpResponse<any>>(`${this.apiUrl}/destinos/${destinoId}`, {observe: 'response'});
    }
}