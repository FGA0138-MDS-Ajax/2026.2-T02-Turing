import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PainelAdmComponent } from './painel-adm.component';

describe('PainelAdmComponent', () => {
    let component: PainelAdmComponent;
    let fixture: ComponentFixture<PainelAdmComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
          imports: [PainelAdmComponent]
        })
        .compileComponents();

        fixture = TestBed.createComponent(PainelAdmComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
