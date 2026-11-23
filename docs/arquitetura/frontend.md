

# Arquitetura do Frontend



## Visão geral



O frontend do OpenRoute é desenvolvido utilizando Angular, framework baseado em TypeScript utilizado para construir interfaces de aplicações web.



Sua responsabilidade é apresentar as funcionalidades do sistema ao usuário, permitir a interação com os recursos disponíveis e exibir os dados retornados pelo backend.



## Organização interna



O frontend está organizado em módulos e componentes com responsabilidades específicas:



- **pages:** reúne as páginas e interfaces principais da aplicação, incluindo as áreas administrativas e operacionais.

- **services:** concentra os serviços responsáveis pela comunicação com a API do backend.

- **models:** define as estruturas e os tipos de dados utilizados pela aplicação.

- **shared:** reúne componentes e recursos compartilhados entre diferentes partes da interface.

- **config:** contém configurações utilizadas pela aplicação, incluindo o endereço da API.



## Tecnologias utilizadas



- **Angular:** framework utilizado para o desenvolvimento da aplicação.

- **TypeScript:** linguagem utilizada na implementação da lógica do frontend.

- **HTML:** estruturação dos elementos das páginas.

- **CSS:** estilização das interfaces.

- **Leaflet:** biblioteca utilizada para a apresentação de mapas e informações geográficas.



## Comunicação com o backend



A comunicação entre o frontend e o backend ocorre por meio de requisições HTTP realizadas pelos serviços da aplicação.



Esses serviços são responsáveis por enviar os dados necessários às operações e receber as respostas disponibilizadas pela API.



## Visualização de mapas



A aplicação utiliza a biblioteca Leaflet para apresentar informações geográficas e visualizar trajetos em mapas, auxiliando o usuário na compreensão das rotas de entrega.



