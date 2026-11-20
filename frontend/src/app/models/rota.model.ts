export interface Rota {
    id: number;
    data_execucao: string;
    status: Status;
    nome?: string;
    distancia_total_metros?: number;
    tempo_estimado_segundos?: number;
    geometria?: string;
    criada_em: string;
    atualizada_em: string;
    enderecos: Array<RotaEndereco>;
}

export interface RotaEndereco {
    endereco_id?: number;
    ordem_parada: number;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro?: string;
    cidade: string;
    estado: string;
    cep: string;
    pais: string;
    referencia?: string;
    latitude: number;
    longitude: number;
    janela_inicio?: Date;
    janela_fim?: Date;
    chegada_prevista?: string;
    saida_prevista?: string;
} 

export interface RotaCreateRequest {
    ids_enderecos: Array<number>
    data_execucao: string;
    hora_saida: string;
    nome?: string;
    velocidade_media_kmh: number;
}

export interface RotaCreateResponse {
    mensagem: string;
    rota_id: number;
    rota_otimizada: any;
    distancia_total_km: number;
    tempo_estimado_min: number;
    geometria: any;
    geometria_aproximada: any;
    provedor_calculo: string;
}

export enum Status {
    RASCUNHO = "RASCUNHO",
    CALCULADA = "CALCULADA",
    EM_ANDAMENTO = "EM_ANDAMENTO",
    CONCLUIDA = "CONCLUIDA",
    CANCELADA = "CANCELADA"
}