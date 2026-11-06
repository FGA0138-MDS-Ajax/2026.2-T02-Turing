import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmAlertasComponent } from './adm-alertas.component';

describe('AdmAlertasComponent', () => {
  let component: AdmAlertasComponent;
  let fixture: ComponentFixture<AdmAlertasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmAlertasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmAlertasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
