import { Component } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';
import { CommonModule } from '@angular/common';

interface Restricao {
    id: Number;
    nome: String;
    valor: String;
}

@Component({
    selector: 'app-adm-restricoes',
    imports: [HeaderComponent, CommonModule],
    templateUrl: './adm-restricoes.component.html',
    styleUrl: './adm-restricoes.component.css'
})
export class AdmRestricoesComponent {

    restrictions: Array<Restricao> = [
        {
        id: 0,
        nome: "Tempo de entrega",
        valor: "300h"
        }
    ];

    criarRestricao(): void {
        console.log("criar restrição")
    }

    deletarRestricao(id: Number): void {
        console.log("deletar restrição id", id);
    }

    editarRestricao(id: Number): void {
        console.log("editar restrição id", id);
    }

}
