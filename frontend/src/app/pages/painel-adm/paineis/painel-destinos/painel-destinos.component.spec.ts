import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelDestinosComponent } from './painel-destinos.component';

describe('PainelDestinosComponent', () => {
  let component: PainelDestinosComponent;
  let fixture: ComponentFixture<PainelDestinosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PainelDestinosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PainelDestinosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
