

# API de Usuários



## Visão geral



A API de usuários é responsável por disponibilizar operações relacionadas ao gerenciamento das contas cadastradas no OpenRoute.



O sistema possui dois perfis de acesso:



- **ADM:** perfil responsável pelas atividades administrativas e pelo gerenciamento de contas.

- **USUARIO:** perfil operacional utilizado pelo motorista.





## Funcionalidades



A API de usuários contempla operações administrativas e operacionais, de acordo com o perfil de acesso.



### Operações do ADM



O perfil ADM é responsável pelo gerenciamento das contas cadastradas no sistema, podendo realizar operações como:



- Cadastrar novos usuários.

- Consultar informações de usuários cadastrados.

- Listar os usuários registrados.

- Atualizar dados cadastrais.

- Desativar contas de acesso, quando disponível.



### Operações do USUARIO



O perfil USUARIO corresponde ao motorista e utiliza os recursos relacionados à sua própria conta e às atividades operacionais do sistema, podendo envolver:



- Consultar suas próprias informações cadastrais.

- Visualizar os dados associados à sua conta.

- Atualizar informações próprias, caso essa operação esteja disponível.

- Há outras operações em relação ao sistema em geral que são descritas no arquivo usuarios.md.



## Controle de acesso



As permissões são determinadas pelo perfil autenticado.



O ADM possui acesso às operações administrativas de gerenciamento de usuários, enquanto o USUARIO possui acesso às operações permitidas para sua própria conta, sem permissão para administrar contas de terceiros.



## Controle de acesso



As operações administrativas devem respeitar as permissões associadas ao perfil do usuário autenticado.



O perfil ADM é responsável pelo gerenciamento das contas, enquanto o perfil USUARIO utiliza os recursos operacionais disponibilizados pelo sistema.



## Comunicação com o backend



As operações são disponibilizadas por meio de endpoints HTTP da API do OpenRoute.



Os métodos, caminhos, parâmetros e formatos de resposta devem ser documentados de acordo com a implementação efetiva do backend.



