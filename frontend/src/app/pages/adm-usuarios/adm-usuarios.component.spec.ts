import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmUsuariosComponent } from './adm-usuarios.component';

describe('AdmUsuariosComponent', () => {
  let component: AdmUsuariosComponent;
  let fixture: ComponentFixture<AdmUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
