import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { UsuarioCreate, Usuario } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  // busca os usuarios salvos no banco
  obterUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}/usuarios`);
  }

  // registra um novo usuario no banco
  cadastrarUsuario(dadosUsuario: UsuarioCreate): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/usuarios`, dadosUsuario);
  }

  // exclui um usuario do banco
  excluirUsuario(idUsuario: Number): Observable<HttpResponse<any>> {
    return this.http.delete<HttpResponse<any>>(`${this.apiUrl}/usuarios/${idUsuario}`, {observe: 'response'});
  }
}