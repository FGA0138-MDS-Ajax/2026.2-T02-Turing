
export interface GeometriaRota {
  type: 'LineString';
  coordinates: number[][];
}

export interface ParadaRota {
  ordem: number;
  id_destino: number;
  endereco: string;
  latitude: number;
  longitude: number;
}

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
  enderecos: RotaEndereco[];
}

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

export interface RotaCreateRequest {
  ids_enderecos: number[];
  data_execucao: string;
  hora_saida: string;
  nome?: string;
  velocidade_media_kmh?: number;
}

export interface RotaCreateResponse {
  mensagem: string;
  rota_id: number;
  rota_otimizada: ParadaRota[];
  distancia_total_km: number;
  tempo_estimado_min: number;
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