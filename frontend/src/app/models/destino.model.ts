
export interface Destino {
  id: number;

  logradouro: string;
  numero: string;
  cidade: string;
  estado: string;
  cep: string;

  complemento?: string | null;
  bairro?: string | null;

  latitude?: number | null;
  longitude?: number | null;

  // Endereços usados como origem podem não ter janela.
  // Endereços de entrega precisam ter os dois horários.
  janela_inicio?: string | null;
  janela_fim?: string | null;

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

  // O cadastro permite endereços sem janela,
  // para que possam ser usados como origem.
  janela_inicio?: string | null;
  janela_fim?: string | null;
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

  // null permite remover uma janela existente.
  janela_inicio?: string | null;
  janela_fim?: string | null;
}

export enum StatusValidacao {
  PENDENTE = 'PENDENTE',
  VALIDADO = 'VALIDADO',
  FALHOU = 'FALHOU'
}