// tipos e helpers compartilhados entre o painel do cliente e o do motorista

// status que existem no banco (enum da tabela pedidos)
export type StatusPedido =
  | 'PENDENTE'
  | 'PLANEJADO'
  | 'SAIU_PARA_ENTREGA'
  | 'EM_ANDAMENTO'
  | 'ENTREGUE'
  | 'FALHOU'
  | 'CANCELADO';

// status
export const ROTULOS_STATUS: Record<StatusPedido, string> = {
  PENDENTE: 'Pendente',
  PLANEJADO: 'Planejado',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  EM_ANDAMENTO: 'Em andamento',
  ENTREGUE: 'Entregue',
  FALHOU: 'Falhou',
  CANCELADO: 'Cancelado'
};

// pedido como vem de GET /pedidos.
// os campos opcionais dependem do que o back devolver (cliente usa cep/numero, motorista usa endereco/lat/lon)
// esperar q o pessoal do back alinhe isso
export interface Pedido {
  id: number;
  descricao?: string | null;
  status: StatusPedido | string;
  cep?: string;
  numero?: string;
  endereco?: string;
  latitude?: number | null;
  longitude?: number | null;
  data_entrega?: string;
  janela_entrega_inicio?: string | null;
  janela_entrega_fim?: string | null;
}

// corpo enviado em POST /pedidos
export interface NovoPedido {
  descricao: string;
  cep: string;
  numero: string;
  data_entrega: string;
  janela_entrega_inicio?: string;
  janela_entrega_fim?: string;
}

// contrato de POST /calcular-rota (schema Destino do back)
export interface DestinoRota {
  id: number;
  endereco: string;
  latitude: number;
  longitude: number;
}

export interface ParadaRota {
  ordem: number;
  id_destino: number;
  endereco: string;
  latitude: number;
  longitude: number;
}

export interface RespostaRota {
  mensagem: string;
  rota_otimizada: ParadaRota[];
  distancia_total_km: number;
  tempo_estimado_min: number;
}

// devolve o status (se vier um status desconhecido, mostra como veio)
export function rotuloStatus(status: string): string {
  return (ROTULOS_STATUS as Record<string, string>)[status] ?? status;
}

// classe css do selo de status, ex: SAIU_PARA_ENTREGA == status-saiu-para-entrega
export function classeStatus(status: string): string {
  return 'status-' + status.toLowerCase().replace(/_/g, '-');
}

// endereço para exibir, mesmo que o back só devolva cep + número
export function textoEndereco(pedido: Pedido): string {
  if (pedido.endereco) {
    return pedido.endereco;
  }
  if (pedido.cep) {
    return `CEP ${pedido.cep}` + (pedido.numero ? `, nº ${pedido.numero}` : '');
  }
  return 'Endereço não informado';
}

// "08:00:00" -> "08:00 às 12:00"
export function textoJanela(pedido: Pedido): string {
  const inicio = pedido.janela_entrega_inicio?.slice(0, 5);
  const fim = pedido.janela_entrega_fim?.slice(0, 5);
  if (inicio && fim) {
    return `${inicio} às ${fim}`;
  }
  return 'Sem janela definida';
}