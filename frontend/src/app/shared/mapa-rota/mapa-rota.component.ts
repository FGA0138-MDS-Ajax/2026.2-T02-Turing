import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild
} from '@angular/core';
import * as L from 'leaflet';
import { ParadaRota } from '../../models/pedido.model';

// mostra a rota otimizada no mapa: paradas numeradas na ordem de visita
// e uma linha ligando os pontos (a volta ao ponto de partida fica tracejada)
// o back ainda não devolve o traçado pelas ruas, então a linha é reta entre as paradas 
@Component({
  selector: 'app-mapa-rota',
  standalone: true,
  template: `
    <div
      #mapa
      class="mapa"
      role="img"
      aria-label="Mapa com a rota otimizada e as paradas numeradas"
    ></div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .mapa {
      width: 100%;
      height: 400px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      z-index: 0;
    }

    @media (max-width: 640px) {
      .mapa {
        height: 300px;
      }
    }
  `]
})
export class MapaRotaComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() paradas: ParadaRota[] = [];

  @ViewChild('mapa', { static: true }) private mapaEl!: ElementRef<HTMLDivElement>;

  private mapa?: L.Map;
  private readonly camada = L.layerGroup();

  ngAfterViewInit(): void {
    this.mapa = L.map(this.mapaEl.nativeElement, { scrollWheelZoom: false });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; colaboradores do <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.mapa);

    this.camada.addTo(this.mapa);
    this.desenhar();

    // garante o tamanho certo caso o container tenha acabado de aparecer
    setTimeout(() => this.mapa?.invalidateSize());
  }

  ngOnChanges(): void {
    this.desenhar();
  }

  ngOnDestroy(): void {
    this.mapa?.remove();
  }

  private desenhar(): void {
    if (!this.mapa) {
      return;
    }

    this.camada.clearLayers();

    const paradas = this.paradas.filter(
      (p) => p.latitude != null && p.longitude != null
    );
    if (!paradas.length) {
      return;
    }

    const pontos = paradas.map((p) => L.latLng(p.latitude, p.longitude));

    // trajeto na ordem de visita
    L.polyline(pontos, { color: '#0f766e', weight: 4, opacity: 0.85 }).addTo(this.camada);

    // volta ao ponto de partida (tracejada)
    if (pontos.length > 1) {
      L.polyline([pontos[pontos.length - 1], pontos[0]], {
        color: '#0f766e',
        weight: 3,
        opacity: 0.6,
        dashArray: '6 8'
      }).addTo(this.camada);
    }

    paradas.forEach((p, i) => {
      // popup montado com textContent: o endereço vem do banco e não deve virar html
      const popup = document.createElement('div');
      popup.textContent = `${p.ordem}. ${p.endereco}`;

      L.marker(pontos[i], {
        icon: this.icone(p.ordem, i === 0),
        title: `${p.ordem}. ${p.endereco}`
      })
        .bindPopup(popup)
        .addTo(this.camada);
    });

    this.mapa.fitBounds(L.latLngBounds(pontos), { padding: [40, 40], maxZoom: 16 });
  }

  // marcador numerado (a parada 1, que é a partida, fica mais escura)
  private icone(ordem: number, partida: boolean): L.DivIcon {
    const cor = partida ? '#0f172a' : '#0f766e';
    const estilo = [
      'width:28px',
      'height:28px',
      'border-radius:50%',
      `background:${cor}`,
      'color:#ffffff',
      'border:2px solid #ffffff',
      'box-shadow:0 1px 4px rgba(0,0,0,.35)',
      'display:flex',
      'align-items:center',
      'justify-content:center',
      'font:600 13px system-ui,sans-serif'
    ].join(';');

    return L.divIcon({
      className: '',
      html: `<div style="${estilo}">${ordem}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  }
}