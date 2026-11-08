export interface Rota {
    id: Number;
    motorista_id: Number;
    criada_por_id?: Number;
    nome?: String;
    data_execucao: String;
    status: Status;
    distancia_total_metros?: Number;
    tempo_estimado_segundos?: Number;
    geometria?: String;
    provedor_calculo?: String;
    calculada_em?: String
    criada_em: String
    atualizada_em: String
}

export enum Status {
    RASCUNHO = 'Rascunho',
    CALCULADA = 'Calculada',
    EM_ANDAMENTO = 'Em Andamento',
    CONCLUIDA = 'Concluida',
    CANCELADA = 'Cancelada'
}