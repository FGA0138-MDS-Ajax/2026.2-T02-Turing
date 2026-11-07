import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RotaService {
  private apiUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  // calc rota: envia os destinos p/ otimizacao
  calcularRota(destinos: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/calcular-rota`, { destinos });
  }

  // obeter pedidos: busca a lista de pedidos salvos no banco p/ o motorista ver nas entregas
  obterPedidos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pedidos`);
  }

  // criar pedido: usado pelo cliente p/ registar um novo pedido
  criarPedido(dadosPedido: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pedidos`, dadosPedido);
  }
}