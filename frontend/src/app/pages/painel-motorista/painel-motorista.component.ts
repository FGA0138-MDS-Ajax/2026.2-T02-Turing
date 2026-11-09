import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RotaService } from '../../services/rota.service';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { MapaRotaComponent } from '../../shared/mapa-rota/mapa-rota.component';
import { mensagemDeErro } from '../../shared/erro.util';
import {
  DestinoRota,
  Pedido,
  RespostaRota,
  classeStatus,
  rotuloStatus,
  textoEndereco
} from '../../models/pedido.model';

// pedidos nesses status não entram mais em uma rota
const STATUS_FINALIZADOS = ['ENTREGUE', 'CANCELADO'];

@Component({
  selector: 'app-painel-motorista',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, MapaRotaComponent],
  templateUrl: './painel-motorista.component.html',
  styleUrls: ['../../shared/painel-base.css', './painel-motorista.component.css']
})
export class PainelMotoristaComponent implements OnInit {
  // por enquanto o motorista só tem a aba de entregas
  readonly abas = [{ id: 'entregas', rotulo: 'Entregas' }];
  abaAtiva = 'entregas';

  // helpers usados direto no html
  readonly rotulo = rotuloStatus;
  readonly classe = classeStatus;
  readonly textoEndereco = textoEndereco;

  // lista de entregas vinda do back
  listaEntregas: Pedido[] = [];
  carregando = false;
  erroLista = '';

  // ids marcados nos checkboxes e ponto de partida escolhido entre eles
  selecionados = new Set<number>();
  pontoPartidaId: number | null = null;

  // cálculo da rota
  calculando = false;
  erroRota = '';
  resultado: RespostaRota | null = null;

  // bloco do resultado, usado para levar o foco até ele quando a rota chega
  @ViewChild('blocoResultado') private blocoResultado?: ElementRef<HTMLElement>;

  constructor(private rotaService: RotaService) {}

  ngOnInit(): void {
    this.carregarPedidos();
  }

  // busca as entregas no back
  carregarPedidos(): void {
    this.carregando = true;
    this.erroLista = '';

    this.rotaService.obterPedidos().subscribe({
      next: (pedidos) => {
        this.listaEntregas = pedidos;
        this.carregando = false;

        // tira da seleção o que sumiu da lista ou deixou de poder ser selecionado
        this.selecionados = new Set(
          Array.from(this.selecionados).filter((id) =>
            pedidos.some((p) => p.id === id && this.podeSelecionar(p))
          )
        );
        this.ajustarPontoPartida();
      },
      error: (erro) => {
        this.carregando = false;
        this.erroLista = mensagemDeErro(erro, 'Não foi possível carregar as entregas.');
      }
    });
  }

  // o back precisa de latitude e longitude para montar a matriz de distâncias
  temCoordenadas(pedido: Pedido): boolean {
    return pedido.latitude != null && pedido.longitude != null;
  }

  // só entra na rota quem tem coordenadas e ainda não foi finalizado
  podeSelecionar(pedido: Pedido): boolean {
    return this.temCoordenadas(pedido) && !STATUS_FINALIZADOS.includes(pedido.status);
  }

  // explica por que a entrega não pode ser marcada
  motivoBloqueio(pedido: Pedido): string {
    if (STATUS_FINALIZADOS.includes(pedido.status)) {
      return 'Entrega já finalizada';
    }
    if (!this.temCoordenadas(pedido)) {
      return 'Endereço ainda sem localização no mapa';
    }
    return '';
  }

  get entregasSelecionaveis(): Pedido[] {
    return this.listaEntregas.filter((p) => this.podeSelecionar(p));
  }

  // entregas marcadas, na ordem em que aparecem na tabela
  get pedidosSelecionados(): Pedido[] {
    return this.listaEntregas.filter((p) => this.selecionados.has(p.id));
  }

  get todasSelecionadas(): boolean {
    const selecionaveis = this.entregasSelecionaveis;
    return selecionaveis.length > 0 && selecionaveis.every((p) => this.selecionados.has(p.id));
  }

  trackPorId(_indice: number, pedido: Pedido): number {
    return pedido.id;
  }

  // marca ou desmarca uma entrega
  alternarSelecao(pedido: Pedido): void {
    if (!this.podeSelecionar(pedido)) {
      return;
    }
    if (this.selecionados.has(pedido.id)) {
      this.selecionados.delete(pedido.id);
    } else {
      this.selecionados.add(pedido.id);
    }
    this.ajustarPontoPartida();
  }

  // marca ou desmarca todas as entregas que podem entrar na rota
  alternarTodas(): void {
    if (this.todasSelecionadas) {
      this.selecionados.clear();
    } else {
      this.entregasSelecionaveis.forEach((p) => this.selecionados.add(p.id));
    }
    this.ajustarPontoPartida();
  }

  // o ponto de partida precisa ser uma das entregas marcadas, se não for usa a primeira
  private ajustarPontoPartida(): void {
    const marcadas = this.pedidosSelecionados;
    if (!marcadas.some((p) => p.id === this.pontoPartidaId)) {
      this.pontoPartidaId = marcadas.length ? marcadas[0].id : null;
    }
  }

  // envia as entregas marcadas p otimizador
  // o back trata o primeiro destino da lista como início e fim da rota então o ponto de partida escolhido vai na frente
  calcularRota(): void {
    const marcadas = this.pedidosSelecionados;
    if (marcadas.length < 2 || this.calculando) {
      return;
    }

    const partida = marcadas.find((p) => p.id === this.pontoPartidaId) ?? marcadas[0];
    const ordenadas = [partida, ...marcadas.filter((p) => p.id !== partida.id)];

    const destinos: DestinoRota[] = ordenadas.map((p) => ({
      id: p.id,
      endereco: textoEndereco(p),
      latitude: p.latitude as number,
      longitude: p.longitude as number
    }));

    this.calculando = true;
    this.erroRota = '';
    this.resultado = null;

    this.rotaService.calcularRota(destinos).subscribe({
      next: (resposta) => {
        this.calculando = false;
        this.resultado = resposta;
        // espera o bloco aparecer na tela e leva a visão até ele
        setTimeout(() => {
          const bloco = this.blocoResultado?.nativeElement;
          bloco?.scrollIntoView({ block: 'start' });
          bloco?.focus({ preventScroll: true });
        });
      },
      error: (erro) => {
        this.calculando = false;
        this.erroRota = mensagemDeErro(
          erro,
          'Não foi possível calcular a rota. Tente de novo em instantes.'
        );
      }
    });
  }

  // 12.5 vira 12,50 km
  formatarKm(km: number): string {
    return (
      km.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' km'
    );
  }

  // 65 vira "1 h 05 min"
  formatarDuracao(minutos: number): string {
    const total = Math.round(minutos);
    const horas = Math.floor(total / 60);
    const resto = total % 60;
    return horas > 0 ? `${horas} h ${String(resto).padStart(2, '0')} min` : `${resto} min`;
  }
}