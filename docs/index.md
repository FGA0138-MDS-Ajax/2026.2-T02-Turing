
# OpenRoute

Bem-vindo à documentação do **OpenRoute**, uma plataforma de otimização de rotas de entrega desenvolvida para auxiliar na organização e no planejamento de operações com múltiplos destinos.

O sistema busca apoiar a definição da sequência de atendimento e dos trajetos a serem percorridos, considerando os destinos e as restrições operacionais cadastradas.

Esta documentação reúne informações sobre o funcionamento, a arquitetura, as funcionalidades, as integrações e os procedimentos necessários para instalar, executar e testar o projeto.

## Por onde começar?

Se você está acessando o projeto pela primeira vez, recomendamos seguir esta sequência:

1. **[Apresentação do projeto](visao-geral/apresentacao.md):** conheça a proposta e os objetivos do OpenRoute.
2. **[Preparação do ambiente](instalacao/ambiente.md):** confira os programas e ferramentas necessários.
3. **[Configuração do banco de dados](instalacao/banco-de-dados.md):** consulte as orientações para preparar o banco.
4. **[Instalação do backend](instalacao/backend.md):** configure e execute a aplicação responsável pela API.
5. **[Instalação do frontend](instalacao/frontend.md):** configure e execute a interface da plataforma.
6. **[Testes](testes/testes.md):** consulte os procedimentos para verificar o funcionamento do sistema.

## Documentação do projeto

### Visão geral

Apresenta o propósito, o escopo e as funcionalidades previstas para o OpenRoute.

- [Apresentação](visao-geral/apresentacao.md)
- [Escopo do projeto](visao-geral/escopo.md)

### Arquitetura

Descreve a organização dos componentes e o funcionamento das partes que compõem a plataforma.

- [Arquitetura geral](arquitetura/arquitetura-geral.md)
- [Backend](arquitetura/backend.md)
- [Frontend](arquitetura/frontend.md)
- [Fluxo de otimização](arquitetura/fluxo-otimizacao.md)
- [Integrações externas](arquitetura/integracoes.md)

### API

Reúne a documentação dos endpoints e das operações disponibilizadas pelo backend.

- [Autenticação](api/autenticacao.md)
- [Destinos](api/destinos.md)
- [Pedidos e entregas](api/pedidos.md)
- [Restrições operacionais](api/restricoes.md)
- [Rotas](api/rotas.md)
- [Usuários](api/usuarios.md)

### Banco de dados

Apresenta a estrutura das tabelas e os relacionamentos utilizados para armazenar as informações do sistema.

- [Modelo de dados](banco-de-dados/modelo-de-dados.md)

### Instalação e execução

Contém os requisitos e os procedimentos necessários para preparar e executar o projeto.

- [Preparação do ambiente](instalacao/ambiente.md)
- [Instalação do banco de dados](instalacao/banco-de-dados.md)
- [Instalação do backend](instalacao/backend.md)
- [Instalação do frontend](instalacao/frontend.md)

### Testes

Apresenta os comandos e procedimentos utilizados para verificar o funcionamento da aplicação.

- [Documentação de testes](testes/testes.md)

## Perfis de acesso

O OpenRoute possui dois perfis de acesso:

- **ADM:** responsável pelas atividades administrativas do sistema.
- **USUARIO:** perfil operacional utilizado pelo motorista.

## Tecnologias e integrações

O projeto utiliza tecnologias e serviços externos para implementar suas funcionalidades, incluindo:

- **Python e Flask:** desenvolvimento do backend e disponibilização da API.
- **Angular e TypeScript:** desenvolvimento da interface frontend.
- **MySQL:** gerenciamento e armazenamento dos dados.
- **Nominatim:** conversão de endereços em coordenadas geográficas (geocodificação).
- **OSRM:** obtenção de matrizes de distância e informações de trajetos.

Para mais detalhes, consulte a documentação de [arquitetura](arquitetura/arquitetura-geral.md) e [integrações](arquitetura/integracoes.md).
