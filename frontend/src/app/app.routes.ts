import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PainelMotoristaComponent } from './pages/painel-motorista/painel-motorista.component';
import { PainelClienteComponent } from './pages/painel-cliente/painel-cliente.component';
import { AdmRestricoesComponent } from './pages/painel-adm/painel-adm.component';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        data: { breadcrumb: 'Home' }
    },
    {
        path: 'painel-adm',
        component: AdmRestricoesComponent,
        data: { breadcrumb: 'Painel do ADM' }
    },
    {
        path: 'painel-motorista',
        component: PainelMotoristaComponent,
        data: { breadcrumb: 'Painel do Motorista' }
    },
    {
        path: 'painel-cliente', // add rota do cliente
        component: PainelClienteComponent,
        data: { breadcrumb: 'Painel do Cliente' }
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];