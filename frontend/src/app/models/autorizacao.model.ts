import { Usuario } from "./usuario.model";

export interface LoginResponse {
  token: String;
  tipo: String;
  expira_em: String;
  usuario: Usuario;
}

export interface LoginInput{
    email: String
    senha: String
}