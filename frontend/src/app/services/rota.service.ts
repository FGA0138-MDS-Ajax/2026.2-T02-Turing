import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { DestinoRota, NovoPedido, Pedido, RespostaRota } from '../models/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class RotaService {
  private readonly apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  // calcula a rota: o primeiro destino da lista vira o ponto de partida e de volta (regra do otimizador)
  calcularRota(destinos: DestinoRota[]): Observable<RespostaRota> {
    return this.http.post<RespostaRota>(`${this.apiUrl}/calcular-rota`, { destinos });
  }

  // busca os pedidos salvos no banco
  obterPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/pedidos`);
  }

  // registra um novo pedido
  criarPedido(dadosPedido: NovoPedido): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiUrl}/pedidos`, dadosPedido);
  }
}