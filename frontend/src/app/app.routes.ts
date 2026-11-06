import { Routes } from '@angular/router';
import { PainelAdmComponent } from './pages/painel-adm/painel-adm.component';
import { HomeComponent } from './pages/home/home.component';
import { PainelMotoristaComponent } from './pages/painel-motorista/painel-motorista.component'; //importando o componente motorista 



export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        data: { breadcrumb: 'Home' }
    },
    {
        path: 'painelAdm',
        component: PainelAdmComponent,
        data: { breadcrumb: 'Painel ADM' }
    },

    {
        path: 'painel-motorista', //add a rota do motorista
        component: PainelMotoristaComponent,
        data: { breadcrumb: 'Painel do Motorista' }
    },
    {
        path: '**',
        redirectTo: 'home'
    }

];
