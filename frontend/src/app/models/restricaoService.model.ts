export interface atualizarRestricaoInput {
    id: Number;
    janela_inicio?: String;
    janela_fim?: String;
    capacidade_maxima?: Number;
    unidade_capacidade?: String;
    observacoes?: String;
}

export interface cadastrarRestricaoInput {
    rota_id: Number;
    janela_inicio?: String;
    janela_fim?: String;
    capacidade_maxima?: Number;
    unidade_capacidade?: String;
    observacoes?: String;
}