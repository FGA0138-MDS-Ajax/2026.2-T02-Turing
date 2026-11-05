import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { PainelRestricoesComponent } from './paineis/painel-restricoes/painel-restricoes.component';
import { PainelDestinosComponent } from './paineis/painel-destinos/painel-destinos.component';
import { CommonModule } from '@angular/common';

interface TabPainel {
    id: Number,
    label: String
}

@Component({
    selector: 'app-painel-adm',
    imports: [
        CommonModule,
        HeaderComponent,
        PainelDestinosComponent,
        PainelRestricoesComponent
    ],
    templateUrl: './painel-adm.component.html',
    styleUrl: './painel-adm.component.css'
})
export class PainelAdmComponent {
    public painelSelecionado: Number = 0;

    public tabsPainel: Array<TabPainel> = [
        {
            id: 0,
            label: 'Destinos'
        },
        {
            id: 1,
            label: 'Restrições'
        }
    ];

    public alteraPainel(id: Number): void {
        this.painelSelecionado = id;
    }
}
