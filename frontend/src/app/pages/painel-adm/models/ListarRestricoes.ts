import { Restricao } from "../../../models/restricao.model";

export interface ListarRestricoes extends Restricao{
    nome_rota?: String;
}