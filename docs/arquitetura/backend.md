

\# Arquitetura do Backend



\## Visão geral



O backend do OpenRoute é desenvolvido em Python, utilizando o framework Flask para disponibilizar os serviços da aplicação por meio de uma API REST.



Sua responsabilidade é receber as requisições do frontend, validar os dados recebidos, executar as regras de negócio e retornar as respostas correspondentes.



\## Organização interna



O código do backend está organizado em módulos, separados de acordo com suas responsabilidades:



\- \*\*api:\*\* contém os endpoints responsáveis por receber e responder às requisições HTTP.

\- \*\*schemas:\*\* reúne as estruturas de validação dos dados recebidos e enviados pela API.

\- \*\*models:\*\* define os modelos que representam as entidades e estruturas persistidas no banco de dados.

\- \*\*repositories:\*\* concentra as operações de acesso e manipulação dos dados armazenados.

\- \*\*services:\*\* reúne serviços responsáveis pela execução de operações e regras de negócio.

\- \*\*core:\*\* contém configurações e componentes centrais, incluindo recursos relacionados ao cálculo e à otimização de rotas.

\- \*\*integracoes:\*\* organiza a comunicação com serviços externos utilizados pela aplicação.

\- \*\*db:\*\* reúne componentes relacionados à conexão e ao acesso ao banco de dados.



\## Tecnologias utilizadas



As principais tecnologias e ferramentas utilizadas no backend são:



\- \*\*Python:\*\* linguagem de programação utilizada no desenvolvimento.

\- \*\*Flask:\*\* framework responsável pela disponibilização da API.

\- \*\*SQLAlchemy:\*\* ferramenta de mapeamento objeto-relacional (ORM), utilizada na comunicação com o banco de dados.

\- \*\*MySQL:\*\* sistema gerenciador de banco de dados utilizado para persistência das informações.

\- \*\*Pydantic:\*\* biblioteca utilizada para validação e estruturação de dados.



\## Processamento das requisições



De forma geral, o processamento ocorre da seguinte maneira:



1\. A API recebe uma requisição HTTP enviada pelo frontend.

2\. Os dados recebidos são validados conforme as estruturas definidas nos schemas.

3\. A lógica correspondente é executada pelos serviços da aplicação.

4\. Quando necessário, os repositórios realizam operações no banco de dados.

5\. A API retorna uma resposta ao solicitante.



Essa organização separa as responsabilidades do backend e facilita a manutenção e a evolução do sistema.



