import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { UsuarioCreateRequest, Usuario, UsuarioUpdateRequest } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  // busca os usuarios salvos no banco
  listarUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`);
  }

  // busca um usuario salvos no banco
  obterUsuario(idUsuario: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/usuarios/${idUsuario}`);
  }

  // registra um novo usuario no banco
  cadastrarUsuario(dadosUsuario: UsuarioCreateRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, dadosUsuario);
  }

  // atualiza um usuario do banco
  atualizarUsuario(idUsuario: number, dadosAtualizados: UsuarioUpdateRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/usuarios/${idUsuario}`, dadosAtualizados);
  }

  // exclui um usuario do banco
  excluirUsuario(idUsuario: Number): Observable<HttpResponse<any>> {
    return this.http.delete<HttpResponse<any>>(`${this.apiUrl}/usuarios/${idUsuario}`, {observe: 'response'});
  }
}