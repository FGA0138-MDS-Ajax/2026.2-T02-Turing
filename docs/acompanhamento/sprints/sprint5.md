# Sprint 5 - Funcionalidades do mapa (16/11/2026 - 22/11/2026)


## Entrega

**Funcionalidades do mapa** - Aplicação completa, devendo refinamentos.

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
| C06.2 | 5 | Fallback entre provedores | **COULD** | Alterar automaticamente para provedor reserva em caso de falha. |
| C07.1 | 5 | Segurança e LGPD | **MUST** | Proteger dados de localização e pessoais conforme a LGPD. |

## Status da sprint

### Backlog

| Numeração | Nome | O que foi feito | Desenvolvimento | Testes |
|---|---|---|---|---|
| C01.1 | Login de Usuários | Correção na tela para aderir a um novo endpoint para cadastro público de usuários, que não requer token de autenticação, alteração na home para ter o botão de logout | 100% | 0% |
| C01.2 | Controle de sessão | Criação de uma função de remoção de sessão no front para deixar mais limpo, implementação de testes do backend para remoção de sessão ao mudar dados da conta | 100% | 50% |
| C02.1 | Cadastro de usuários | Adição de verificação de campos nos formulários de atualização e cadastro de usuários, adição de opção para alteração de senha dos usuários no painel ADM e alteração no modo de desativar e ativar contas, ampliação dos testes para contemplar o novo endpoint de cadastro público e as novas atualizações sobre o endpoint de atualização de usuário | 100% | 60% |
| C02.2 | Gestão de perfis | Adição do perfil no modelo de atualização de usuarios no backend, removendo a sessão do usuário alterado para evitar utilização de funcionalidades indevidas e adição da opção de alterar perfis no front, implementação de testes sobre as funcionalidades de alteração de perfil e a revogação de sessões relacionada | 100% | 50% |
| C03.1 | Cadastro de destinos | Refatoração do painel de usuários para adequar ao escopo novo, com o cadastro de endereços para criação de destinos para uso na formação da rota, implementação de testes para cadastro e atualização dos endereços com janelas de tempo | 80% | 35% |
| C03.2 | Validação de endereços | Acoplamento da validação de endereços com o front do painel de usuários. | 80% | 20% |
| C03.3 | Listagem e revisão de destinos | Adição da listagem e das opções de edição e deleção de destinos cadastrados pelo usuário ao painel de usuários. | 100% | 0% |
| C04.1 | Converter endereços textuais em coordenadas (latitude/longitude). | Melhorias e refinamentos na entrada de dados dos endereços e da geocodificação | 60% | 30% |
| C04.2 | Integração com API de geocodificação | Melhorias na entrada de dados dos endereços e da geocodificação | 60% | 20% |
| C05.1 | Cálculo de rota otimizada | Atualização do front para chamar o cálculo das rotas com período de tempo e lista de destinos para otimização | 100% | 60% |
| C05.2 | Exibição da rota no mapa | Adição do componente de mapeamento da rota, com listagem de destinos, paradas, distância e outros dados ao painel do usuário. | 100% | 0% |
| C05.3 | Desempenho do cálculo | Nada | 100% | 100% |
| C06.1 | Integração com API de mapas/rotas | Integração da API de mapas, para utilização no painel do usuário | 100% | 30% |
| C06.2 | Fallback entre provedores | Definição de mais de uma API nas funções relacionadas a geocodificação de endereços | 100% | 0% |
| C07.1 | Segurança e LGPD | Apenas o usuário que cria os destinos pode vê-los e alterá-los. Sendo o acesso a esses dados liberados de acordo com a sessão do usuário. | 50% | 0% |

### Geral

Correções de algumas funcionalidades do login, para evitar conflitos de autenticação. Edição da tela de home. Término do desenvolvimento do painel de ADM, contendo agora verificação de campos e edição de senhas e perfis. Refatoração da tela de usuários para encaixar no escopo, contendo agora cadastro, listagem, edição e exclusão de destinos, definição de dados para cálculo da rota e exibição da rota em mapa interativo. Faltando alguns ajustes na geocodificação de endereços, testes nas telas do frontend e alguns testes na parte do backend.