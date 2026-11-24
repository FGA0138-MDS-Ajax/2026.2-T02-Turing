
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

import {
  GeometriaRota,
  ParadaRota
} from '../../models/rota.model';

@Component({
  selector: 'app-mapa-rota',
  standalone: true,
  template: `
    <div
      #mapa
      class="mapa"
      role="img"
      aria-label="Mapa com o trajeto e as paradas numeradas"
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
export class MapaRotaComponent
  implements AfterViewInit, OnChanges, OnDestroy {

  @Input() paradas: ParadaRota[] = [];
  @Input() geometria: GeometriaRota | null = null;
  @Input() geometriaAproximada = false;

  @ViewChild('mapa', { static: true })
  private mapaEl!: ElementRef<HTMLDivElement>;

  private mapa?: L.Map;
  private readonly camada = L.layerGroup();

  ngAfterViewInit(): void {
    this.mapa = L.map(this.mapaEl.nativeElement, {
      scrollWheelZoom: false
    });

    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution:
          '&copy; colaboradores do ' +
          '<a href="https://www.openstreetmap.org/copyright">' +
          'OpenStreetMap</a>'
      }
    ).addTo(this.mapa);

    this.camada.addTo(this.mapa);
    this.desenhar();

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
      p =>
        Number.isFinite(p.latitude) &&
        Number.isFinite(p.longitude)
    );

    if (!paradas.length) {
      return;
    }

    const pontos = paradas.map(
      p => L.latLng(p.latitude, p.longitude)
    );

    // GeoJSON usa [longitude, latitude].
    // Leaflet utiliza [latitude, longitude].
    const trajeto = (
      this.geometria?.type === 'LineString'
        ? this.geometria.coordinates
        : []
    )
      .filter(
        coordenada =>
          coordenada.length >= 2 &&
          Number.isFinite(coordenada[0]) &&
          Number.isFinite(coordenada[1])
      )
      .map(
        ([longitude, latitude]) =>
          L.latLng(latitude, longitude)
      );

    if (trajeto.length >= 2) {
      // Desenha a geometria devolvida pelo backend.
      L.polyline(trajeto, {
        color: '#0f766e',
        weight: 4,
        opacity: 0.85,
        dashArray: this.geometriaAproximada
          ? '6 8'
          : undefined
      }).addTo(this.camada);
    } else {
      // Alternativa visual quando nao houver geometria.
      L.polyline(pontos, {
        color: '#0f766e',
        weight: 4,
        opacity: 0.65,
        dashArray: '6 8'
      }).addTo(this.camada);

      if (pontos.length > 1) {
        L.polyline(
          [pontos[pontos.length - 1], pontos[0]],
          {
            color: '#0f766e',
            weight: 3,
            opacity: 0.6,
            dashArray: '6 8'
          }
        ).addTo(this.camada);
      }
    }

    paradas.forEach((parada, indice) => {
      const popup = document.createElement('div');
      popup.textContent =
        `${parada.ordem}. ${parada.endereco}`;

      L.marker(pontos[indice], {
        icon: this.icone(
          parada.ordem,
          indice === 0
        ),
        title: `${parada.ordem}. ${parada.endereco}`
      })
        .bindPopup(popup)
        .addTo(this.camada);
    });

    const limites = L.latLngBounds(
      trajeto.length >= 2
        ? [...trajeto, ...pontos]
        : pontos
    );

    this.mapa.fitBounds(limites, {
      padding: [40, 40],
      maxZoom: 16
    });
  }

  private icone(
    ordem: number,
    partida: boolean
  ): L.DivIcon {
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