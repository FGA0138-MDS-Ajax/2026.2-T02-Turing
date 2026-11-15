

\# Preparação do Ambiente



Este documento apresenta os programas e ferramentas necessários para preparar o computador para o desenvolvimento e a execução do OpenRoute.



O projeto é dividido em duas aplicações:



\- \*\*Backend:\*\* desenvolvido em Python, utilizando Flask.

\- \*\*Frontend:\*\* desenvolvido em Angular, utilizando TypeScript.



Além dessas tecnologias, o sistema utiliza um banco de dados MySQL para armazenar suas informações.



Antes de iniciar a instalação e a configuração das aplicações, é necessário instalar os programas descritos a seguir.



\## 1. Programas necessários



| Programa | Finalidade | Obrigatório |

|---|---|---|

| Git | Obter os repositórios e trabalhar com as branches do projeto. | Sim |

| Python | Executar o backend. | Sim |

| Node.js | Disponibilizar o ambiente de execução do Angular. | Sim |

| npm | Instalar e gerenciar as dependências do frontend. | Sim |

| MySQL Server | Gerenciar o banco de dados utilizado pelo sistema. | Sim |





\## 2. Além do git e Python, é necessário Node.js e npm



O Node.js fornece o ambiente necessário para executar as ferramentas do Angular.



O npm é o gerenciador de pacotes instalado juntamente com o Node.js. Ele será utilizado para instalar as bibliotecas e ferramentas necessárias ao frontend.



O frontend do OpenRoute utiliza Angular 19.2.



\### 2.1 Instalação



1\. Acesse o site oficial: https://nodejs.org/.

2\. Baixe uma versão LTS compatível com Angular 19.2. Recomenda-se Node.js 22 LTS.

3\. Execute o instalador.

4\. Conclua a instalação mantendo as opções recomendadas.



O npm será instalado automaticamente junto com o Node.js.



\### 2.2 Verificação



Abra o PowerShell e execute:



```powershell

node --version

```



Depois, verifique o npm:



```powershell

npm --version

```



Os dois comandos deverão apresentar as versões instaladas.



\## 3. MySQL Server



O MySQL é o sistema gerenciador de banco de dados utilizado pelo backend do OpenRoute.



Ele é responsável por armazenar as informações persistentes da aplicação, incluindo usuários, endereços, registros de entrega e rotas.



\### 3.1 Instalação



1\. Acesse o site oficial: https://dev.mysql.com/downloads/installer/.

2\. Baixe o instalador do MySQL para Windows.

3\. Execute o instalador.

4\. Selecione a instalação do MySQL Server.

5\. Durante a configuração, defina um usuário administrativo e uma senha.

6\. Conclua a instalação e configure o servidor para iniciar como serviço do Windows.



O backend utiliza a porta `3307` como configuração padrão de conexão com o banco de dados. Essa porta será configurada posteriormente durante a preparação do backend.



Também é possível utilizar o MariaDB, que é compatível com o mecanismo de conexão utilizado pelo projeto. Nesse caso, a instalação e a configuração devem respeitar os parâmetros esperados pelo backend.



\### 3.2 Verificação



Abra o PowerShell e execute:



```powershell

mysql --version

```



Se o comando estiver disponível, o terminal apresentará a versão do cliente MySQL.



Caso o comando não seja reconhecido, verifique se a pasta `bin` da instalação do MySQL foi adicionada à variável de ambiente `PATH`.



\## 4. Ferramentas opcionais



Além dos programas obrigatórios, algumas ferramentas podem facilitar o desenvolvimento e a administração do sistema, como o MySql.



\### 4.1 MySQL Workbench



O MySQL Workbench é uma ferramenta gráfica que facilita a administração do banco de dados, permitindo executar comandos SQL, consultar tabelas e visualizar a estrutura do banco.



Download: https://dev.mysql.com/downloads/workbench/



Sua instalação é opcional. As operações com o banco também podem ser realizadas pelo terminal.



\## 5. Conferência dos programas instalados



Após concluir as instalações, abra o PowerShell e execute os comandos abaixo para verificar se as ferramentas estão disponíveis:



\### Git



```powershell

git --version

```



\### Python



```powershell

python --version

```



\### pip



```powershell

python -m pip --version

```



\### Node.js



```powershell

node --version

```



\### npm



```powershell

npm --version

```



\### MySQL



```powershell

mysql --version

```



Se os comandos apresentarem as respectivas versões, as ferramentas estarão disponíveis no terminal.



Caso algum comando não seja reconhecido, verifique se o programa foi instalado corretamente e se seu diretório executável está configurado na variável de ambiente `PATH`.



\## 6. Próximas etapas



Após instalar os programas necessários, o ambiente estará preparado para iniciar a configuração das aplicações.



Os procedimentos seguintes estão separados em documentos específicos:



\- \*\*Instalação do backend:\*\* apresenta como obter o código da branch correta, criar o ambiente virtual, instalar as dependências, configurar as variáveis de ambiente e executar a API.

\- \*\*Instalação do frontend:\*\* apresenta como obter o código da branch correta, instalar as dependências do Angular, configurar a comunicação com a API e executar a interface.



Consulte os documentos `backend.md` e `frontend.md`, localizados nesta mesma seção da documentação, para realizar essas etapas.



