# API de Restrições



## Visão geral



A API de restrições operacionais tem como finalidade permitir o gerenciamento das condições que devem ser consideradas durante o planejamento das rotas, como janelas de horário.



## Estrutura das restrições



O modelo de restrição contempla informações como:



| Campo | Descrição |
|---|---|
| `id` | Identificador da restrição. |
| `rota\_id` | Identificador da rota à qual a restrição está associada. |
| `janela\_inicio` | Horário inicial da janela permitida. |
| `janela\_fim` | Horário final da janela permitida. |
| `observacoes` | Informações adicionais sobre a restrição. |


## Operações previstas



A interface do frontend contempla chamadas para as seguintes operações:



- **Cadastrar restrição:** informar a rota associada, os horários permitidos e as observações.

- **Consultar restrições:** obter as restrições cadastradas.

- **Atualizar restrição:** modificar os dados de uma restrição existente.

- **Excluir restrição:** remover uma restrição cadastrada.





## Relação com a otimização de rotas



As restrições operacionais têm a finalidade de fornecer condições adicionais para o planejamento das entregas.



Entre os exemplos estão os horários em que uma entrega pode ser realizada e os limites de capacidade que devem ser respeitados durante a operação.



A aplicação efetiva dessas condições no algoritmo de otimização depende de sua implementação e integração com o processo de cálculo das rotas.

