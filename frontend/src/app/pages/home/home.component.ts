import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
    selector: 'app-home',
    imports: [HeaderComponent],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css'
})
export class HomeComponent {

    funcaoExemplo() {
        console.log('Texto clicado!');
    }
}
