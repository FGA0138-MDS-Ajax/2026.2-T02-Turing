import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../config/api.config';
import { LoginInput, LoginResponse } from '../models/autorizacao.model';

@Injectable({
    providedIn: 'root'
})
export class AutenticacaoService {
    private readonly apiUrl = API_URL;

    constructor(private http: HttpClient) {}

    //loga o usuario e retorna o token de autenticacao junto do tipo de usuario
    public login(input : LoginInput): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, input);
    }

    //torna o token de autenticacao inativo
    public logout(): Observable<HttpResponse<any>> {
        return this.http.post<HttpResponse<any>>(`${this.apiUrl}/auth/logout`, {}, {observe: 'response'});
    }

     public removerSessionLogin(): void {
        sessionStorage.removeItem('BearerToken');
        sessionStorage.removeItem('TipoUsuario');
     }
}