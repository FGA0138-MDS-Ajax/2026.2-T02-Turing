import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AdmUsuariosComponent } from './pages/adm-usuarios/adm-usuarios.component';
import { AdmRestricoesComponent } from './pages/adm-restricoes/adm-restricoes.component';
import { AdmAlertasComponent } from './pages/adm-alertas/adm-alertas.component';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
        data: { breadcrumb: 'Home' }
    },
    {
        path: 'admUsuarios',
        component: AdmUsuariosComponent,
        data: { breadcrumb: 'Painel ADM - Usuários' }
    },
        {
        path: 'admAlertas',
        component: AdmAlertasComponent,
        data: { breadcrumb: 'Painel ADM - Alertas' }
    },
        {
        path: 'admRestricoes',
        component: AdmRestricoesComponent,
        data: { breadcrumb: 'Painel ADM - Restrições' }
    },
    {
        path: '**',
        redirectTo: 'home'
    }
];
