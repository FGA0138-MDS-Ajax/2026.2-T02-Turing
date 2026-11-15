

\# API de Pedidos



\## Visão geral



Os pedidos representam as entregas que precisam ser organizadas pelo OpenRoute. Cada pedido está associado a um endereço, cujas informações geográficas são utilizadas no planejamento e na otimização das rotas.



O gerenciamento de pedidos está previsto no projeto, mas os endpoints completos de cadastro, listagem e edição ainda não estão implementados no backend analisado.



\## Estrutura dos pedidos



A tabela `pedidos`, definida no banco de dados, possui os seguintes campos:



| Campo | Descrição |

|---|---|

| id | Identificador do pedido. |

| endereco\_id | Identificador do endereço associado ao pedido. |

| criado\_por\_id | Identificador do usuário responsável pela criação, quando informado. |

| descricao | Descrição adicional do pedido. |

| data\_entrega | Data prevista para a entrega. |

| janela\_entrega\_inicio | Horário inicial permitido para a entrega. |

| janela\_entrega\_fim | Horário final permitido para a entrega. |

| status | Situação atual do pedido. |

| criado\_em | Data e horário de criação do registro. |

| atualizado\_em | Data e horário da última atualização. |



As coordenadas geográficas não precisam ser preenchidas diretamente no pedido. Elas pertencem ao endereço associado e são obtidas pelo processo de geocodificação.



\## Status dos pedidos



O modelo de dados prevê os seguintes estados:



\- `PENDENTE`: pedido ainda não planejado em uma rota.

\- `PLANEJADO`: pedido associado ao planejamento de uma rota.

\- `SAIU\_PARA\_ENTREGA`: pedido cuja entrega foi iniciada.

\- `EM\_ANDAMENTO`: entrega em andamento.

\- `ENTREGUE`: entrega concluída.

\- `FALHOU`: entrega não realizada.

\- `CANCELADO`: pedido cancelado.



\## Relação com a API de rotas



Os pedidos são utilizados como entrada no processo de otimização de rotas.



A API de rotas recebe os identificadores dos pedidos que devem fazer parte do planejamento. O backend verifica se esses identificadores correspondem a pedidos existentes antes de associá-los à rota.



\## Endpoints disponíveis



\- Cadastro de pedidos.

\- Listagem de pedidos.

\- Edição de pedidos.



\## Observação



A existência da tabela e do modelo de pedidos no banco de dados não significa que todas as operações de gerenciamento estejam disponíveis pela API.



A documentação dos endpoints será complementada quando essas operações forem implementadas no backend, ao final da sprint 6.



