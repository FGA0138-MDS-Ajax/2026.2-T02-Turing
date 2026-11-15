

\# API de Rotas



\## Visão geral



A API de rotas é responsável por calcular trajetos otimizados e disponibilizar operações de criação e consulta de rotas.



O sistema utiliza os destinos e pedidos informados para organizar a sequência de atendimento e obter informações sobre distância, tempo estimado e geometria do trajeto.



\## Endpoints disponíveis



| Método HTTP | Endpoint | Descrição |

|---|---|---|

| POST | `/calcular-rota` | Calcula uma sequência otimizada para os destinos recebidos. |

| POST | `/rotas/` | Cadastra uma rota no banco de dados. |

| GET | `/rotas/{rota\_id}` | Consulta uma rota pelo seu identificador. |

| GET | `/health` | Verifica se a API está funcionando. |



\## Detalhamento dos endpoints



\### 1. Calcular rota



\- \*\*Método:\*\* POST

\- \*\*Endpoint:\*\* `/calcular-rota`

\- \*\*Descrição:\*\* recebe uma lista de destinos e calcula uma sequência otimizada de atendimento.

\- \*\*Dados de entrada:\*\* lista de destinos contendo suas informações e coordenadas geográficas.

\- \*\*Validação:\*\* exige pelo menos dois destinos e coordenadas de latitude e longitude para cada ponto.

\- \*\*Processamento:\*\* utiliza informações de deslocamento do OSRM e o algoritmo de otimização implementado no backend.

\- \*\*Alternativa:\*\* caso o OSRM apresente falha, o sistema utiliza distâncias calculadas pela fórmula de Haversine.

\- \*\*Resposta:\*\* informações relacionadas à rota calculada.



\### 2. Cadastrar rota



\- \*\*Método:\*\* POST

\- \*\*Endpoint:\*\* `/rotas/`

\- \*\*Descrição:\*\* recebe os dados de uma rota e solicita ao repositório seu armazenamento no banco de dados.

\- \*\*Resposta de sucesso:\*\* HTTP 201.



\### 3. Consultar rota



\- \*\*Método:\*\* GET

\- \*\*Endpoint:\*\* `/rotas/{rota\_id}`

\- \*\*Descrição:\*\* consulta uma rota pelo identificador informado.

\- \*\*Resposta de sucesso:\*\* HTTP 200.

\- \*\*Rota não encontrada:\*\* HTTP 404.



\### 4. Verificar funcionamento da API



\- \*\*Método:\*\* GET

\- \*\*Endpoint:\*\* `/health`

\- \*\*Descrição:\*\* verifica se a API está em funcionamento.

\- \*\*Resposta:\*\* informa o estado da aplicação.



\## Algoritmo de otimização



O backend utiliza um algoritmo de otimização para determinar a ordem de atendimento dos destinos.



A implementação contempla a heurística do vizinho mais próximo e uma etapa de melhoria da sequência por meio do método 2-opt.



\## Integração com serviços externos



O cálculo utiliza o OSRM para obter informações de deslocamento pelas vias reais.



Quando o serviço não está disponível, o backend utiliza a fórmula de Haversine para estimar distâncias em linha reta.



O TomTom aparece como uma possibilidade de integração futura, mas não está implementado como provedor alternativo no fluxo atual.



\## Dados armazenados



A estrutura de uma rota contempla informações como:



\- Identificador da rota.

\- Usuário associado.

\- Data de execução.

\- Status da rota.

\- Distância total.

\- Tempo estimado.

\- Geometria do trajeto.

\- Provedor utilizado no cálculo.



\## Observações



O cálculo de uma rota e o armazenamento de uma rota são operações distintas: o primeiro determina a sequência e as informações do trajeto; o segundo registra os dados da rota no banco de dados.



