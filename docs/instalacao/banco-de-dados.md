

# Configuração do banco de dados



Este documento apresenta as etapas necessárias para preparar o banco de dados utilizado pelo OpenRoute.

O script está na branch developer.



O sistema utiliza o MySQL para armazenar informações relacionadas aos usuários, endereços, entregas, rotas e restrições operacionais.



## 1. Verificar a instalação do MySQL



Antes de começar, confirme se o MySQL Server está instalado e se o serviço está em execução.



No PowerShell, execute:



```powershell

mysql --version

```



O comando deve apresentar a versão do cliente MySQL instalado.



Para consultar os serviços relacionados ao MySQL no Windows, execute:



```powershell

Get-Service *mysql*

```



Se o serviço estiver parado, inicie-o pelo aplicativo de gerenciamento de serviços do Windows.



Caso o comando `mysql` não seja reconhecido, verifique se a pasta `bin` da instalação do MySQL foi adicionada ao PATH do Windows.



## 2. Verificar a porta do servidor



O backend utiliza as variáveis de ambiente para definir os dados de conexão com o banco.



No arquivo `.env.example` do backend, a porta de referência está configurada como:



```text

DB\_PORT=3307

```



Portanto, verifique se o MySQL está utilizando essa porta.



Caso esteja utilizando outra, será necessário ajustar a variável `DB\_PORT` no arquivo `.env` do backend para corresponder à porta real do servidor.



## 3. Acessar o MySQL



Abra o PowerShell e execute:



```powershell

mysql -u root -p -P 3307

```



O comando utiliza o usuário `root` e a porta `3307`.



Quando solicitado, digite a senha configurada durante a instalação do MySQL.



Se o servidor estiver utilizando outra porta, substitua `3307` pela porta correspondente.



Após a conexão, o terminal apresentará o prompt do MySQL, permitindo executar comandos SQL.



## 4. Criar o banco de dados



No terminal do MySQL, execute:



```sql

CREATE DATABASE open\_route;

```



Esse comando cria o banco de dados utilizado pelo OpenRoute.



Para verificar se ele foi criado corretamente:



```sql

SHOW DATABASES;

```



O resultado deverá apresentar `open\_route` na lista de bancos disponíveis.



Para selecionar o banco criado:



```sql

USE open\_route;

```



## 5. Criar as tabelas do sistema



A criação do banco de dados não cria automaticamente as tabelas necessárias para armazenar as informações do OpenRoute.



É necessário executar o script SQL de criação do esquema correspondente à versão atual do projeto.



A estrutura do banco de dados do OpenRoute contempla as seguintes tabelas:



| Tabela | Finalidade |
|---|---|
| `perfis` | Armazena os perfis de acesso do sistema. |
| `usuarios` | Armazena os usuários cadastrados. |
| `sessoes` | Armazena informações relacionadas às sessões de acesso. |
| `enderecos` | Armazena os endereços utilizados nas entregas, incluindo as coordenadas geográficas. |
| `pedidos` | Armazena os registros internos de entregas. |
| `rotas` | Armazena as rotas cadastradas e calculadas. |
| `restricoes\_operacionais` | Armazena as restrições operacionais associadas às rotas. |
| `rota\_pedidos` | Relaciona as rotas às entregas e registra a sequência de atendimento. |


**Importante:** a tabela `pedidos` representa registros internos de entregas utilizados na operação do sistema. Ela não representa um fluxo de compras ou pedidos realizados por clientes.



O banco utiliza os perfis `ADM` e `USUARIO`, sendo `USUARIO` o perfil operacional correspondente ao motorista.





## 6. Conferir a criação das tabelas



Depois de executar o script SQL correspondente à versão atual do projeto, selecione o banco:



```sql

USE open\_route;

```



Liste as tabelas existentes:



```sql

SHOW TABLES;

```



Confira se as tabelas esperadas aparecem no resultado.



Para consultar a estrutura de uma tabela específica, utilize:



```sql

DESCRIBE usuarios;

```



Por exemplo, para consultar a estrutura da tabela de rotas:



```sql

DESCRIBE rotas;

```



Esses comandos permitem verificar se as tabelas foram criadas e consultar suas colunas.



## 7. Configurar a conexão com o backend



Depois de preparar o banco, configure os dados de conexão no arquivo `.env` localizado na raiz do backend.



As principais variáveis são:



| Variável | Descrição |
|---|---|
| `DB\_HOST` | Endereço do servidor MySQL. |
| `DB\_PORT` | Porta utilizada pelo servidor MySQL. |
| `DB\_USER` | Usuário utilizado na conexão. |
| `DB\_PASSWORD` | Senha do usuário do banco. |
| `DB\_NAME` | Nome do banco de dados. |


Exemplo de configuração local:



```text

DB\_HOST=localhost

DB\_PORT=3307

DB\_USER=root

DB\_PASSWORD=sua\_senha

DB\_NAME=open\_route

```



Substitua `sua\_senha` pela senha real do usuário configurado no MySQL.



**Atenção:** esse exemplo apresenta valores de referência. As credenciais devem corresponder à configuração efetiva do servidor instalado no computador.



Não compartilhe o arquivo `.env` nem envie senhas ou outras credenciais para o repositório.



## 8. Verificar a conexão com o banco



Depois de configurar o `.env`, inicie o backend seguindo as instruções do documento `backend.md`.



A conexão com o banco será utilizada pelas operações do sistema que acessam os dados armazenados no MySQL.



Caso ocorram erros de conexão, confira:



- Se o serviço do MySQL está em execução.

- Se o banco `open\_route` existe.

- Se as tabelas necessárias foram criadas.

- Se o endereço e a porta estão corretos.

- Se o usuário e a senha estão corretos.

- Se as variáveis do arquivo `.env` correspondem à configuração do servidor.



As mensagens de erro apresentadas no terminal do backend podem ajudar a identificar a origem do problema.



## 9. Encerrar a conexão com o MySQL



Para sair do terminal do MySQL, execute:



```sql

EXIT;

```



O banco de dados continuará disponível enquanto o serviço do MySQL estiver em execução.



## 10. Finalização



Após concluir as etapas, o banco de dados estará preparado para ser utilizado pelo backend, desde que o esquema completo e as tabelas correspondentes à versão atual do OpenRoute tenham sido criados.



Para iniciar a API e verificar sua comunicação com o banco, consulte o documento `backend.md`.



