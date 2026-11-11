import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { API_URL } from '../config/api.config';
import { Perfil, UsuarioCreate, UsuarioResponse } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = API_URL;

  constructor(private http: HttpClient) {}


  // busca os usuarios salvos no banco
  obterUsuarios(): Observable<UsuarioResponse[]> {
    return this.http.get<UsuarioResponse[]>(`${this.apiUrl}/usuarios`);
  }

  // registra um novo usuario no banco
  cadastrarUsuario(dadosUsuario: UsuarioCreate): Observable<UsuarioResponse> {
    return this.http.post<UsuarioResponse>(`${this.apiUrl}/usuarios`, dadosUsuario);
  }

  // exclui um usuario do banco
  excluirUsuario(idUsuario: Number): Observable<String> {
    return this.http.delete<String>(`${this.apiUrl}/usuarios/${idUsuario}`);
  }
}