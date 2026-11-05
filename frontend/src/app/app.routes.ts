import { Routes } from '@angular/router';
import { PainelAdmComponent } from './pages/painel-adm/painel-adm.component';
import { HomeComponent } from './pages/home/home.component';

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
        path: '**',
        redirectTo: 'home'
    }
];
