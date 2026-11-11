export interface LoginInput{
    email: String
    senha: String
}

export interface UsuarioCreate{
    nome: String
    email: String
    senha: String
    telefone?: String
}

export interface UsuarioResponse{
    id: Number
    nome: String
    email: String
    telefone?: String
    ativo: Boolean
    perfil: Perfil
    criado_em: Date
}

export enum Perfil {
    ADM = 'Administrador',
    USUARIO = 'Usuário',
}