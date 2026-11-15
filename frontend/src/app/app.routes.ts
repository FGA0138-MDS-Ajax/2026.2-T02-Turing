import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PainelMotoristaComponent } from './pages/painel-motorista/painel-motorista.component';
import { PainelClienteComponent } from './pages/painel-cliente/painel-cliente.component';
import { PainelAdmComponent } from './pages/painel-adm/painel-adm.component';
import { AutenticacaoComponent } from './pages/autenticacao/autenticacao.component';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        data: { breadcrumb: 'Home' }
    },
    {
        path: 'autenticacao',
        component: AutenticacaoComponent,
        data: { breadcrumb: 'Autenticacao' }
    },
    {
        path: 'painel-adm',
        component: PainelAdmComponent,
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