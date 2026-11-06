import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmRestricoesComponent } from './adm-restricoes.component';

describe('AdmRestricoesComponent', () => {
  let component: AdmRestricoesComponent;
  let fixture: ComponentFixture<AdmRestricoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmRestricoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmRestricoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
