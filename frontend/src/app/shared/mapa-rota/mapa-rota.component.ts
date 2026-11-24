
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
  OrigemRota,
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
      aria-label="Mapa com a origem, as entregas e o trajeto da rota"
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

  // Origem independente das entregas.
  @Input() origem: OrigemRota | null = null;

  // Somente as entregas, na ordem otimizada.
  @Input() paradas: ParadaRota[] = [];

  // Geometria calculada pelo backend.
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

    setTimeout(() => {
      this.mapa?.invalidateSize();
    });
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

    // Valida as coordenadas da origem.
    const origemValida =
      this.origem !== null &&
      Number.isFinite(this.origem.latitude) &&
      Number.isFinite(this.origem.longitude);

    const pontoOrigem = origemValida && this.origem
      ? L.latLng(
          this.origem.latitude,
          this.origem.longitude
        )
      : null;

    // Mantém somente entregas com coordenadas válidas.
    const paradasValidas = this.paradas.filter(
      parada =>
        Number.isFinite(parada.latitude) &&
        Number.isFinite(parada.longitude)
    );

    const pontosEntregas = paradasValidas.map(
      parada => L.latLng(
        parada.latitude,
        parada.longitude
      )
    );

    const pontosMarcadores: L.LatLng[] = [
      ...(pontoOrigem ? [pontoOrigem] : []),
      ...pontosEntregas
    ];

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

    // ---------------------------------------
    // DESENHO DO TRAJETO
    // ---------------------------------------

    if (trajeto.length >= 2) {

      // Usa a geometria viária retornada pelo backend.
      L.polyline(trajeto, {
        color: '#0f766e',
        weight: 4,
        opacity: 0.85,
        dashArray: this.geometriaAproximada
          ? '6 8'
          : undefined
      }).addTo(this.camada);

    } else {

      // Caso não haja geometria, utiliza linhas
      // aproximadas ligando origem e entregas.
      const percurso: L.LatLng[] = [
        ...(pontoOrigem ? [pontoOrigem] : []),
        ...pontosEntregas
      ];

      // Retorna à origem, quando ela estiver disponível.
      if (pontoOrigem && pontosEntregas.length > 0) {
        percurso.push(pontoOrigem);
      }

      if (percurso.length >= 2) {
        L.polyline(percurso, {
          color: '#0f766e',
          weight: 4,
          opacity: 0.65,
          dashArray: '6 8'
        }).addTo(this.camada);
      }
    }

    // ---------------------------------------
    // MARCADOR DA ORIGEM
    // ---------------------------------------

    if (pontoOrigem && this.origem) {

      const popupOrigem = document.createElement('div');

      popupOrigem.textContent =
        'Ponto de partida e retorno: ' +
        this.origem.endereco;

      L.marker(pontoOrigem, {
        icon: this.icone('O', true),
        title: 'Origem: ' + this.origem.endereco
      })
        .bindPopup(popupOrigem)
        .addTo(this.camada);
    }

    // ---------------------------------------
    // MARCADORES DAS ENTREGAS
    // ---------------------------------------

    paradasValidas.forEach(parada => {

      const ponto = L.latLng(
        parada.latitude,
        parada.longitude
      );

      const popup = document.createElement('div');

      popup.textContent =
        `Entrega ${parada.ordem}: ${parada.endereco}`;

      L.marker(ponto, {
        icon: this.icone(
          String(parada.ordem),
          false
        ),
        title:
          `Entrega ${parada.ordem}: ${parada.endereco}`
      })
        .bindPopup(popup)
        .addTo(this.camada);
    });

    // ---------------------------------------
    // ENQUADRAMENTO DO MAPA
    // ---------------------------------------

    const pontosVisiveis = [
      ...pontosMarcadores,
      ...trajeto
    ];

    if (pontosVisiveis.length === 0) {
      return;
    }

    if (pontosVisiveis.length === 1) {
      this.mapa.setView(pontosVisiveis[0], 15);
      return;
    }

    const limites = L.latLngBounds(pontosVisiveis);

    this.mapa.fitBounds(limites, {
      padding: [40, 40],
      maxZoom: 16
    });
  }


  private icone(
    rotulo: string,
    ehOrigem: boolean
  ): L.DivIcon {

    // Azul-escuro para a origem.
    // Verde para as entregas.
    const cor = ehOrigem
      ? '#0f172a'
      : '#0f766e';

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
      html: `<div style="${estilo}">${rotulo}</div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    });
  }
}