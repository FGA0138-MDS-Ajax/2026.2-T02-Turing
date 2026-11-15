import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, NavbarComponent],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css', '../../shared/painel-base.css']
})
export class HomeComponent {

    public tipoUsuario: String;

    constructor(){
        this.tipoUsuario = sessionStorage.getItem('TipoUsuario') || '';
    }
}