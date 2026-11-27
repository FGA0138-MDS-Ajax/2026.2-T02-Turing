
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PainelMotoristaComponent } from './painel-motorista.component';
import { DestinoService } from '../../services/destino.service';
import { RotaService } from '../../services/rota.service';
import { Destino, StatusValidacao } from '../../models/destino.model';
import { RotaCreateResponse } from '../../models/rota.model';

describe('PainelMotoristaComponent', () => {
  let component: PainelMotoristaComponent;
  let fixture: ComponentFixture<PainelMotoristaComponent>;

  let destinoServiceMock: jasmine.SpyObj<DestinoService>;
  let rotaServiceMock: jasmine.SpyObj<RotaService>;

  const origem: Destino = {
    id: 1,
    logradouro: 'Rua Origem',
    numero: '10',
    cidade: 'Brasília',
    estado: 'DF',
    cep: '70000000',
    latitude: -15.80,
    longitude: -47.90,
    validacao_status: StatusValidacao.VALIDADO,
    janela_inicio: null,
    janela_fim: null,
    criado_em: '2026-11-27T08:00:00'
  };

  const entrega: Destino = {
    ...origem,
    id: 2,
    logradouro: 'Rua Entrega',
    janela_inicio: '08:00',
    janela_fim: '09:00'
  };

  const respostaRota: RotaCreateResponse = {
    mensagem: 'Rota calculada',
    rota_id: 99,
    origem: {
      id_destino: 1,
      endereco: 'Rua Origem, 10',
      latitude: -15.80,
      longitude: -47.90
    },
    rota_otimizada: [
      {
        ordem: 1,
        id_destino: 2,
        endereco: 'Rua Entrega, 10',
        latitude: -15.80,
        longitude: -47.90,
        janela_inicio: '08:00',
        janela_fim: '09:00',
        chegada_prevista: '2026-11-27T08:10:00',
        atendimento_previsto: '2026-11-27T08:10:00',
        saida_prevista: '2026-11-27T08:10:00',
        espera_min: 0
      }
    ],
    saida_origem_prevista: '2026-11-27T08:00:00',
    retorno_previsto: '2026-11-27T08:30:00',
    distancia_total_km: 5,
    tempo_estimado_min: 30,
    tempo_deslocamento_min: 30,
    tempo_espera_min: 0,
    geometria: {
      type: 'LineString',
      coordinates: []
    },
    geometria_aproximada: true,
    provedor_calculo: 'teste'
  };

  beforeEach(async () => {
    destinoServiceMock = jasmine.createSpyObj<DestinoService>(
      'DestinoService',
      ['listarDestinos', 'cadastrarDestino']
    );

    rotaServiceMock = jasmine.createSpyObj<RotaService>(
      'RotaService',
      ['calcularRota']
    );

    destinoServiceMock.listarDestinos.and.returnValue(
      of([origem, entrega])
    );

    destinoServiceMock.cadastrarDestino.and.returnValue(
      of(origem)
    );

    rotaServiceMock.calcularRota.and.returnValue(
      of(respostaRota)
    );

    await TestBed.configureTestingModule({
      imports: [PainelMotoristaComponent],
      providers: [
        {
          provide: DestinoService,
          useValue: destinoServiceMock
        },
        {
          provide: RotaService,
          useValue: rotaServiceMock
        }
      ]
    })
      .overrideComponent(PainelMotoristaComponent, {
        set: { template: '' }
      })
      .compileComponents();

    fixture = TestBed.createComponent(
      PainelMotoristaComponent
    );

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o painel do motorista', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os enderecos ao iniciar', () => {
    expect(destinoServiceMock.listarDestinos)
      .toHaveBeenCalledTimes(1);

    expect(component.enderecos).toEqual([
      origem,
      entrega
    ]);
  });

  it('deve permitir origem sem janela de horario', () => {
    expect(component.podeSerOrigem(origem)).toBeTrue();

    expect(component.podeSelecionarEntrega(origem))
      .toBeFalse();
  });

  it('deve exigir janela completa para entrega', () => {
    expect(component.podeSelecionarEntrega(entrega))
      .toBeTrue();

    const entregaSemJanela: Destino = {
      ...entrega,
      janela_fim: null
    };

    expect(
      component.podeSelecionarEntrega(entregaSemJanela)
    ).toBeFalse();
  });

  it('deve rejeitar origem sem geocodificacao validada', () => {
    const origemPendente: Destino = {
      ...origem,
      validacao_status: StatusValidacao.PENDENTE
    };

    expect(component.podeSerOrigem(origemPendente))
      .toBeFalse();
  });

  it('deve impedir que a origem seja selecionada como entrega', () => {
    component.pontoPartidaId = origem.id;

    component.alternarSelecao(origem);

    expect(component.selecionados.has(origem.id))
      .toBeFalse();

    component.alternarSelecao(entrega);

    expect(component.selecionados.has(entrega.id))
      .toBeTrue();
  });

  it('deve remover a origem da selecao ao alterar o ponto de partida', () => {
    component.selecionados.add(origem.id);
    component.pontoPartidaId = origem.id;

    component.aoAlterarPontoPartida();

    expect(component.selecionados.has(origem.id))
      .toBeFalse();
  });

  it('nao deve calcular rota sem origem', () => {
    component.selecionados.add(entrega.id);

    component.calcularRota();

    expect(rotaServiceMock.calcularRota)
      .not.toHaveBeenCalled();

    expect(component.erroRota)
      .toContain('ponto de partida');
  });

  it('nao deve calcular rota sem entregas', () => {
    component.pontoPartidaId = origem.id;

    component.calcularRota();

    expect(rotaServiceMock.calcularRota)
      .not.toHaveBeenCalled();

    expect(component.erroRota)
      .toContain('pelo menos uma entrega');
  });

  it('deve enviar origem e entregas separadamente ao backend', () => {
    component.pontoPartidaId = origem.id;
    component.selecionados.add(entrega.id);

    component.dataExecucao = '2026-11-27';
    component.horaSaida = '08:00';
    component.nomeRota = ' Rota teste ';

    component.calcularRota();

    expect(rotaServiceMock.calcularRota).toHaveBeenCalledWith({
      id_origem: 1,
      ids_enderecos: [2],
      data_execucao: '2026-11-27',
      hora_saida: '08:00',
      nome: 'Rota teste'
    });

    expect(component.resultado).toEqual(respostaRota);
    expect(component.calculando).toBeFalse();
    expect(component.erroRota).toBe('');
  });

  it('deve permitir cadastrar uma origem sem janela', () => {
    component.abrirCadastro();

    component.formEndereco = {
      ...component.formEndereco,
      logradouro: 'Rua Origem',
      numero: '10',
      cidade: 'Brasília',
      estado: 'DF',
      cep: '70000000',
      janela_inicio: '',
      janela_fim: ''
    };

    component.salvarEndereco();

    expect(destinoServiceMock.cadastrarDestino)
      .toHaveBeenCalledWith(
        jasmine.objectContaining({
          janela_inicio: null,
          janela_fim: null
        })
      );

    expect(component.erroFormulario).toBe('');
  });
});