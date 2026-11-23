

# Arquitetura Geral



## Visão geral



O OpenRoute utiliza uma arquitetura cliente-servidor, organizada em camadas, na qual o frontend é responsável pela interface com o usuário, enquanto o backend concentra o processamento das operações e as regras de negócio.



A comunicação entre essas partes ocorre por meio de uma API, responsável por receber as requisições do frontend, processá-las e retornar as respostas correspondentes.



## Componentes principais



A arquitetura do sistema é composta pelos seguintes elementos:



- **Frontend:** desenvolvido em Angular, disponibiliza as interfaces utilizadas para acessar as funcionalidades da plataforma e visualizar informações das operações de entrega.

- **Backend:** desenvolvido em Python com Flask, recebe as requisições, executa as operações do sistema e disponibiliza os serviços por meio de endpoints.

- **Banco de dados:** utiliza MySQL para armazenar as informações necessárias ao funcionamento da aplicação.

- **Serviços externos:** integrações utilizadas em operações relacionadas à geocodificação de endereços e ao cálculo de rotas.



## Comunicação entre os componentes



O funcionamento geral ocorre da seguinte maneira:



1. O usuário interage com a interface do frontend.

2. O frontend envia uma requisição à API do backend.

3. O backend processa a solicitação e executa as regras de negócio correspondentes.

4. Quando necessário, o backend consulta ou modifica informações no banco de dados e utiliza serviços externos.

5. O backend retorna uma resposta ao frontend.

6. O frontend apresenta o resultado ao usuário.



## Organização da arquitetura



A separação entre frontend, backend e banco de dados permite organizar as responsabilidades do sistema, facilitando a manutenção e a evolução de seus componentes.



