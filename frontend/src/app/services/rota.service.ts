import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Rota, RotaCreateRequest } from '../models/rota.model';

@Injectable({
  providedIn: 'root'
})
export class RotaService {
  private readonly apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  // calcula a rota: o primeiro destino da lista vira o ponto de partida e de volta (regra do otimizador)
  calcularRota(dadosRota: RotaCreateRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/rotas/calcular-rota`, dadosRota);
  }

  // lista as rotas do usuario logado
  listarRotas(): Observable<Rota[]> {
    return this.http.get<Rota[]>(`${this.apiUrl}/rotas`);
  }

  // obtem uma rota
  obterRota(rotaId: number): Observable<Rota> {
    return this.http.get<Rota>(`${this.apiUrl}/rotas/${rotaId}`);
  }
}