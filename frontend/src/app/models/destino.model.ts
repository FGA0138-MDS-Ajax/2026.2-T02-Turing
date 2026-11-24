export interface Destino {
    id: number;
    logradouro: string;
    numero: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento?: string;
    bairro?: string;
    latitude?: number;
    longitude?: number;
    janela_inicio?: string;
    janela_fim?: string;
    validacao_status: StatusValidacao;
    criado_em: string;
}

export interface DestinoCreateRequest {
    logradouro: string;
    numero: string;
    cidade: string;
    estado: string;
    cep: string;
    complemento?: string;
    bairro?: string;
    referencia?: string;
    janela_inicio?: string;
    janela_fim?: string;
}

export interface DestinoUpdateRequest {
    logradouro?: string;
    numero?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    complemento?: string;
    bairro?: string;
    referencia?: string;
    janela_inicio?: string;
    janela_fim?: string;
}

export enum StatusValidacao {
    PENDENTE = "PENDENTE",
    VALIDADO = "VALIDADO",
    FALHOU = "FALHOU"
}