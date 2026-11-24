export interface Mensagem {
    tipo: TipoMensagem;
    texto: string;
}

export enum TipoMensagem{
    ERRO = 'erro',
    SUCESSO = 'sucesso'
}