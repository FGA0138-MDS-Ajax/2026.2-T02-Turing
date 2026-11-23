

# API de Autenticação



## Visão geral



A API de autenticação é responsável por controlar o acesso dos usuários ao OpenRoute, permitindo identificar os usuários e verificar suas permissões de acesso.



O sistema possui dois perfis de acesso: **ADM**, destinado às atividades administrativas, e **USUARIO**, correspondente ao perfil operacional utilizado pelo motorista.



## Funcionalidades



A autenticação permite:



- Realizar o acesso ao sistema por meio das credenciais do usuário.

- Identificar o usuário autenticado.

- Controlar o acesso conforme o perfil associado à conta.



## Comunicação com o backend



As operações de autenticação são disponibilizadas pelo backend por meio de endpoints HTTP.



As requisições devem enviar os dados esperados pela API, e as respostas informam o resultado da operação.

