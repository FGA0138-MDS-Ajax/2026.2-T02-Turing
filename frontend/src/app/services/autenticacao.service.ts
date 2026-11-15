import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { API_URL } from '../config/api.config';
import { LoginInput, LoginResponse } from '../models/autorizacao.model';

@Injectable({
  providedIn: 'root'
})
export class AutenticacaoService {
  private readonly apiUrl = API_URL;

  constructor(private http: HttpClient) {}

  public login(input : LoginInput): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, input);
  }

  public logout(): Observable<HttpResponse<any>> {
    return this.http.post<HttpResponse<any>>(`${this.apiUrl}/auth/logout`, {}, {observe: 'response'});
  }
}