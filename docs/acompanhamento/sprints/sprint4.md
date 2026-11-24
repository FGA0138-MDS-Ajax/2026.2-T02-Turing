# Sprint 4 - Funcionalidade de cálculo de rotas otimizadas, integração com OSRM (09/11/2026 - 15/11/2026)


## Entrega

**Funcionalidade de cálculo de rotas otimizadas, integração com OSRM** - Todas as funcionalidades essenciais de otimização de rotas implementadas.

## Itens do backlog que devem ser trabalhados nessa sprint

| Numeração | Sprint | Nome | Priorização | Descrição |
|---|---|---|---|---|
| C01.1 | 3 | Login de Usuários | **MUST** |  Permite que usuários autentiquem-se com e-mail e senha. |
| C01.2 | 3 | Controle de sessão | **MUST** | Manter sessão ativa com expiração por inatividade. |
| C02.1 | 3 | Cadastro de usuários | **MUST** | Permitir que o ADM crie, edite e exclua usuários. |
| C02.2 | 3 | Gestão de perfis | **MUST** | Permitir que o ADM associe perfis (ADM, USUARIO) aos usuários. |
| C03.1 | 2 | Cadastro de destinos | **MUST** | Permitir a inserção de múltiplos destinos com seus respectivos endereços. |
| C03.2 | 2 | Validação de endereços | **MUST** | Validar os endereços inseridos utilizando API de geocodificação |
| C03.3 | 2 | Listagem e revisão de destinos | **SHOULD** | Permitir que o usuário visualize e edite a lista de destinos cadstrados antes de gerar a rota. |
| C04.1 | 3 | Geocodificação de endereços | **MUST** | Converter endereços textuais em coordenadas (latitude/longitude). |
| C04.2 | 3 | Integração com API de geocodificação | **MUST** | Consumir API externa de geocodificação com tratamento de falhas. |
| C05.1 | 4 | Cálculo de rota otimizada | **MUST** | Calcular a rota mais eficiente para um conjunto de destinos, considerando a distância e tempo. |
| C05.2 | 4 | Exibição da rota no mapa | **MUST** | Exibir a rota calculada em mapa interativo. |
| C05.3 | 4 | Desempenho do cálculo | **MUST** | Calcular rotas em até X segundos para até N pedidos. |
| C06.1 | 4 | Integração com API de mapas/rotas | **MUST** | Integrar com provedor externo (Google/OSRM). |

## Status da sprint

### Backlog

| Numeração | Nome | O que foi feito | Desenvolvimento | Testes |
|---|---|---|---|---|
| C01.1 | Login de Usuários | Implementação dos endpoints no backend para login e logout de usuários, com criação de token para controle de sessão e criação da tela de autenticação no frontend, com cadastro e login de usuários, atualização da tela de usuário para permitir entrada na tela de autenticação | 100% | 0% |
| C01.2 | Controle de sessão | Implementação no backend da criação de token de sessão para controlar acesso às funcionalidades do programa, implementação da utilização do token pelo frontend | 100% | 0% |
| C02.1 | Cadastro de usuários | Implementação dos endpoints no backend para o CRUD de usuários, correção do painel de ADM para trabalhar com o escopo novo, tendo agora o CRUD de usuários. Faltando alguns dados e verificações na atualização dos usuários | 78% | 0% |
| C02.2 | Gestão de perfis | Nada | 0% | 0% |
| C03.1 | Cadastro de destinos | Atualização dos endpoints de destinos, para interagir com a verificação de endereços e geocodificação | 40% | 0% |
| C03.2 | Validação de endereços | Atualização dos endpoints para conter interação com a API de verificação e geolocalização de endereços  | 65% | 0% |
| C03.3 | Listagem e revisão de destinos | Atualização dos endpoints de destino, corrigindo a API utilizada, com endpoint para listagem de destinos | 30% | 0% |
| C04.1 | Converter endereços textuais em coordenadas (latitude/longitude). | Atualização dos endpoints de criação de destinos para interagir com a API de geocodificação. | 45% | 0% |
| C04.2 | Integração com API de geocodificação | Adição e correção da API utilizada para a geocodificação de endereços no backend, com verificação de condição de falha da geocodificação. | 45% | 0% |
| C05.1 | Cálculo de rota otimizada | Implementação no backend do cálculo de rotas otimizadas | 45% | 0% |
| C05.2 | Exibição da rota no mapa | Nada | 0% | 0% |
| C05.3 | Desempenho do cálculo | Nada | 0% | 0% |
| C06.1 | Integração com API de mapas/rotas | Nada | 0% | 0% |

### Geral

Tentativa de resolução dos atrasos, com a atualização de APIs, endpoints e telas para condizer com a alteração do escopo anteriormente descrito. Atraso com as tarefas dessa sprint, com o término do desenvolvimento de algumas funcionalidades atrasadas.