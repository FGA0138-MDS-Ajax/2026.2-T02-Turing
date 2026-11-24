
export interface GeometriaRota {
  type: 'LineString';
  coordinates: number[][];
}

// Entrega na ordem calculada pelo otimizador.
export interface ParadaRota {
  ordem: number;
  id_destino: number;
  endereco: string;
  latitude: number;
  longitude: number;

  // Janela cadastrada para a entrega.
  janela_inicio: string;
  janela_fim: string;

  // Horários previstos pelo backend.
  chegada_prevista: string;
  atendimento_previsto: string;
  saida_prevista: string;

  // Espera nesta entrega, em minutos.
  espera_min: number;
}

// Origem e ponto de retorno.
export interface OrigemRota {
  id_destino: number;
  endereco: string;
  latitude: number;
  longitude: number;
}

// Rota armazenada no banco.
export interface Rota {
  id: number;
  data_execucao: string;
  status: Status;
  nome?: string | null;

  distancia_total_metros?: number | null;
  tempo_estimado_segundos?: number | null;
  geometria?: GeometriaRota | null;

  criada_em: string;
  atualizada_em: string;

  // Rotas antigas podem não ter origem independente.
  origem?: RotaEndereco | null;

  enderecos: RotaEndereco[];
}

// Endereço armazenado na rota.
export interface RotaEndereco {
  endereco_id?: number | null;
  ordem_parada: number;

  logradouro: string;
  numero: string;
  complemento?: string | null;
  bairro?: string | null;
  cidade: string;
  estado: string;
  cep: string;
  pais: string;
  referencia?: string | null;

  latitude: number;
  longitude: number;

  janela_inicio?: string | null;
  janela_fim?: string | null;

  chegada_prevista?: string | null;
  saida_prevista?: string | null;
}

// Dados enviados para calcular uma rota.
export interface RotaCreateRequest {
  // Continua opcional no TypeScript temporariamente
  // para preservar compatibilidade com componentes.
  // O backend exige este campo.
  id_origem?: number;

  ids_enderecos: number[];
  data_execucao: string;
  hora_saida: string;

  nome?: string;
  velocidade_media_kmh?: number;
}

// Resultado do POST /calcular-rota.
export interface RotaCreateResponse {
  mensagem: string;
  rota_id: number;

  origem: OrigemRota;
  rota_otimizada: ParadaRota[];

  // Data e hora de saída e retorno.
  saida_origem_prevista: string;
  retorno_previsto: string;

  distancia_total_km: number;

  // Duração total: deslocamento + espera.
  tempo_estimado_min: number;

  // Tempo efetivo de deslocamento.
  tempo_deslocamento_min: number;

  // Tempo aguardando as janelas.
  tempo_espera_min: number;

  geometria: GeometriaRota;
  geometria_aproximada: boolean;
  provedor_calculo: string;
}

export enum Status {
  RASCUNHO = 'RASCUNHO',
  CALCULADA = 'CALCULADA',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  CONCLUIDA = 'CONCLUIDA',
  CANCELADA = 'CANCELADA'
}