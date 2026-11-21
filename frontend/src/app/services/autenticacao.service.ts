
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

import { API_URL } from '../config/api.config';
import { LoginInput, LoginResponse } from '../models/autorizacao.model';
import { Usuario, UsuarioCreateRequest } from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {
  private readonly apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  // Faz login e retorna o token e o perfil do usuario.
  public login(input: LoginInput): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      input
    );
  }

  // Cadastro publico exclusivo para motoristas.
  public cadastrarMotorista(
    dados: UsuarioCreateRequest
  ): Observable<Usuario> {
    return this.http.post<Usuario>(
      `${this.apiUrl}/auth/cadastro`,
      dados
    );
  }

  // Revoga o token de autenticacao.
  public logout(): Observable<HttpResponse<any>> {
    return this.http.post<any>(
      `${this.apiUrl}/auth/logout`,
      {},
      { observe: 'response' }
    );
  }

  // Remove as informacoes de login armazenadas no navegador.
  public removerSessionLogin(): void {
    sessionStorage.removeItem('BearerToken');
    sessionStorage.removeItem('TipoUsuario');
  }
}