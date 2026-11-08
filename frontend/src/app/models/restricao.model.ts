export interface Restricao {
    id: Number;
    rota_id: Number;
    janela_inicio?: String;
    janela_fim?: String;
    capacidade_maxima?: Number;
    unidade_capacidade?: String;
    observacoes?: String
    criada_em: String;
    atualizada_em: String;
}