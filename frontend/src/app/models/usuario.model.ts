export interface UsuarioCreateRequest{
    nome: string;
    email: string;
    senha: string;
    telefone?: string | null;
}

export interface UsuarioUpdateRequest{
    nome?: string;
    email?: string;
    telefone?: string | null;
    senha?: string;
    ativo?: boolean;
    perfil?: Perfil;
}

export interface Usuario{
    id: number;
    nome: string;
    email: string;
    telefone?: string | null;
    ativo: boolean;
    perfil: Perfil;
    criado_em: Date;
}

export enum Perfil {
    ADM = 'ADM',
    USUARIO = 'USUARIO',
}