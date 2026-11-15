# \# OpenRoute

# 

# O \*\*OpenRoute\*\* é uma plataforma de otimização de rotas de entrega, desenvolvida no contexto da disciplina de Métodos de Desenvolvimento de Software.

# 

# O projeto tem como objetivo auxiliar na organização e no planejamento de operações que envolvem múltiplos destinos, apoiando a definição da sequência de atendimento e dos trajetos a serem percorridos.

# 

# \## Objetivo do projeto

# 

# Facilitar o planejamento de entregas por meio do gerenciamento de informações dos destinos, do cálculo de rotas e da visualização dos trajetos em mapas, considerando as informações disponíveis e as restrições operacionais cadastradas.

# 

# \## Funcionalidades

# 

# A plataforma contempla funcionalidades relacionadas a:

# 

# \- Autenticação e gerenciamento de usuários;

# \- Cadastro e gerenciamento de destinos;

# \- Gerenciamento de registros de entregas;

# \- Criação e consulta de rotas;

# \- Cálculo e visualização de trajetos;

# \- Organização da sequência de atendimento;

# \- Gerenciamento de restrições operacionais previstas no projeto.

# 

# \## Perfis de acesso

# 

# O sistema possui dois perfis de acesso:

# 

# \- \*\*ADM:\*\* responsável pelas atividades administrativas.

# \- \*\*USUARIO:\*\* perfil operacional utilizado pelo motorista.

# 

# \## Tecnologias utilizadas

# 

# | Tecnologia | Utilização |

# |---|---|

# | Python | Linguagem utilizada no backend |

# | Flask | Desenvolvimento da API |

# | Angular | Desenvolvimento do frontend |

# | TypeScript | Linguagem utilizada no frontend |

# | MySQL | Banco de dados relacional |

# | MkDocs | Geração da documentação |

# | Material for MkDocs | Tema da documentação |

# | Nominatim | Geocodificação de endereços |

# | OSRM | Serviços de cálculo de trajetos e matrizes de distância |

# 

# \## Organização do repositório

# 

# A branch `docs` é destinada à documentação do projeto.

# 

# A documentação está organizada nas seguintes seções:

# 

# \- `docs/visao-geral/`: apresentação e escopo do OpenRoute.

# \- `docs/arquitetura/`: arquitetura geral, backend, frontend, fluxo de otimização e integrações.

# \- `docs/api/`: documentação dos endpoints da API.

# \- `docs/banco-de-dados/`: modelo de dados e relacionamentos.

# \- `docs/instalacao/`: preparação do ambiente e procedimentos de instalação.

# \- `docs/testes/`: orientações para execução e verificação dos testes.

# \- `docs/atas-reuniao/`: registros de reuniões do projeto.

# 

# \## Documentação

# 

# A documentação completa é disponibilizada por meio do MkDocs com o tema Material.

# 

# Para visualizar a documentação localmente, consulte o arquivo \[Preparação do ambiente](docs/instalacao/ambiente.md) e siga as instruções de instalação e execução.

# 

# Também é possível acessar diretamente os principais documentos:

# 

# \- \[Visão geral](docs/visao-geral/apresentacao.md)

# \- \[Escopo](docs/visao-geral/escopo.md)

# \- \[Arquitetura geral](docs/arquitetura/arquitetura-geral.md)

# \- \[API de rotas](docs/api/rotas.md)

# \- \[Modelo de dados](docs/banco-de-dados/modelo-de-dados.md)

# \- \[Instalação e ambiente](docs/instalacao/ambiente.md)

# \- \[Testes](docs/testes/testes.md)

# 

# A página inicial da documentação está disponível em \[`docs/index.md`](docs/index.md).

# 

# \## Publicação da documentação

# 

# O repositório utiliza GitHub Actions para automatizar a publicação da documentação.

# 

# O workflow está definido em `.github/workflows/ci.yml` e é acionado quando há um `push` na branch `docs`.

# 

# Durante a execução, o pipeline instala o MkDocs Material e utiliza o comando:

# 

# ```bash

# mkdocs gh-deploy --force

