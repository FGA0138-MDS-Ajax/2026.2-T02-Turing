
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])]
    }).compileComponents();
  });

  it('deve criar o componente principal', () => {
    const fixture = TestBed.createComponent(AppComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('deve disponibilizar a área de navegação', () => {
    const fixture = TestBed.createComponent(AppComponent);

    fixture.detectChanges();

    const elemento = fixture.nativeElement as HTMLElement;

    expect(
      elemento.querySelector('router-outlet')
    ).not.toBeNull();
  });

});