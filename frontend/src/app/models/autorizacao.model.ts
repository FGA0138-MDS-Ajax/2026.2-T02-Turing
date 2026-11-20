import { Usuario } from "./usuario.model";

export interface LoginResponse {
  token: string;
  tipo: string;
  expira_em: string;
  usuario: Usuario;
}

export interface LoginInput{
    email: string
    senha: string
}