
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import {
  Rota,
  RotaCreateRequest,
  RotaCreateResponse
} from '../models/rota.model';

@Injectable({
  providedIn: 'root'
})
export class RotaService {
  private readonly apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  // Calcula e armazena a rota no backend.
  calcularRota(
    dadosRota: RotaCreateRequest
  ): Observable<RotaCreateResponse> {
    return this.http.post<RotaCreateResponse>(
      `${this.apiUrl}/calcular-rota`,
      dadosRota
    );
  }

  // Lista as rotas do motorista autenticado.
  listarRotas(): Observable<Rota[]> {
    return this.http.get<Rota[]>(
      `${this.apiUrl}/rotas`
    );
  }

  // Consulta uma rota armazenada.
  obterRota(rotaId: number): Observable<Rota> {
    return this.http.get<Rota>(
      `${this.apiUrl}/rotas/${rotaId}`
    );
  }
}
