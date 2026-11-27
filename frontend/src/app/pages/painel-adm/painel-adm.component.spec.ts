
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { PainelAdmComponent } from './painel-adm.component';
import { UsuarioService } from '../../services/usuario.service';
import { AutenticacaoService } from '../../services/autenticacao.service';

describe('PainelAdmComponent', () => {
  let chamadasListagem: number;

  beforeEach(async () => {
    chamadasListagem = 0;

    await TestBed.configureTestingModule({
      imports: [PainelAdmComponent],
      providers: [
        provideRouter([]),
        {
          provide: UsuarioService,
          useValue: {
            listarUsuarios: () => {
              chamadasListagem++;
              return of([]);
            }
          }
        },
        {
          provide: AutenticacaoService,
          useValue: {}
        }
      ]
    })
      .overrideComponent(PainelAdmComponent, {
        set: { template: '' }
      })
      .compileComponents();
  });

  it('deve criar o painel ADM', () => {
    const fixture = TestBed.createComponent(PainelAdmComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve iniciar na aba de usuarios', () => {
    const fixture = TestBed.createComponent(PainelAdmComponent);

    expect(fixture.componentInstance.abaAtiva)
      .toBe('listar-usuario');
  });

  it('deve carregar os usuarios ao iniciar', () => {
    const fixture = TestBed.createComponent(PainelAdmComponent);

    fixture.detectChanges();

    expect(chamadasListagem).toBe(1);
    expect(fixture.componentInstance.usuarios).toEqual([]);
  });
});