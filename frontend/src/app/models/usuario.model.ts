export interface UsuarioCreateRequest{
    nome: string
    email: string
    senha: string
    telefone?: string
}

export interface UsuarioUpdateRequest{
    nome?: string;
    email?: string;
    telefone?: string;
    senha?: string;
    ativo?: boolean;
}

export interface Usuario{
    id: number
    nome: string
    email: string
    telefone?: string
    ativo: boolean
    perfil: Perfil
    criado_em: Date
}

export enum Perfil {
    ADM = 'ADM',
    USUARIO = 'USUARIO',
}