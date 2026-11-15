

\# Instalação e execução do backend



Este documento apresenta as etapas necessárias para obter, configurar e executar o backend do OpenRoute em um computador Windows.



O backend é desenvolvido em Python e utiliza Flask para disponibilizar a API, MySQL para armazenar os dados e serviços externos para realizar operações relacionadas à geocodificação e ao cálculo de rotas.



\## 1. Obter o código do backend



O backend deve ser obtido a partir da branch `backend` do repositório. Não utilize a branch `main` como referência para esta instalação.



Abra o PowerShell na pasta em que deseja armazenar o projeto e execute:



```powershell

git clone --branch backend --single-branch https://github.com/FGA0138-MDS-Ajax/2026.2-T02-Turing.git OpenRoute-backend

```



Entre na pasta criada:



```powershell

cd .\\OpenRoute-backend

```



Confira se está utilizando a branch correta:



```powershell

git branch

```



A branch atual deve aparecer com um asterisco ao lado:



```text

\* backend

```



Confira também os arquivos disponíveis:



```powershell

Get-ChildItem

```



Entre os arquivos e diretórios esperados estão `app`, `requirements.txt` e `.env.example`.



\## 2. Criar o ambiente virtual



O ambiente virtual permite instalar as dependências do backend de forma isolada, sem misturá-las com os pacotes de outros projetos Python.



Dentro da pasta `OpenRoute-backend`, execute:



```powershell

python -m venv venv

```



Esse comando cria a pasta `venv`, que armazenará o ambiente virtual do projeto.



\## 3. Ativar o ambiente virtual



Para ativar o ambiente virtual no PowerShell, execute:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Após a ativação, o nome `(venv)` deverá aparecer no início da linha do terminal.



\*\*Caso o PowerShell bloqueie a execução do script\*\*, execute:



```powershell

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

```



Em seguida, tente ativar novamente:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Essa alteração vale somente para a sessão atual do PowerShell.



\## 4. Atualizar o instalador de pacotes



Com o ambiente virtual ativado, atualize o `pip`, responsável pela instalação dos pacotes Python:



```powershell

python -m pip install --upgrade pip

```



\## 5. Instalar as dependências do backend



O arquivo `requirements.txt` reúne as bibliotecas utilizadas pelo backend.



Para instalar todas as dependências listadas nele, execute:



```powershell

pip install -r requirements.txt

```



Aguarde a conclusão da instalação.



Para conferir os pacotes instalados, execute:



```powershell

pip list

```



\## 6. Configurar as variáveis de ambiente



O backend utiliza variáveis de ambiente para acessar configurações como os dados de conexão com o banco de dados e os serviços externos.



Na raiz do projeto, existe o arquivo `.env.example`, que serve como modelo de configuração.



Crie uma cópia com o nome `.env`:



```powershell

Copy-Item .env.example .env

```



Abra o arquivo para edição:



```powershell

notepad .env

```



Confira as variáveis disponíveis no modelo e preencha os valores necessários para o ambiente em que o projeto será executado.



Entre as configurações previstas no arquivo estão:



\- \*\*Banco de dados:\*\* endereço do servidor, porta, usuário, senha e nome do banco.

\- \*\*Nominatim:\*\* configurações utilizadas na consulta de endereços e obtenção de coordenadas geográficas.

\- \*\*OSRM:\*\* endereço do serviço utilizado no cálculo de matrizes e trajetos.

\- \*\*TomTom:\*\* campo destinado à chave de acesso ao serviço.

\- \*\*Timeout:\*\* tempo limite de espera para as requisições externas.

\- \*\*Administrador:\*\* campos de nome, e-mail e senha previstos no modelo de configuração.



Para a configuração do banco de dados, confira especialmente:



| Variável | Valor de referência |

|---|---|

| `DB\_HOST` | `localhost` |

| `DB\_PORT` | `3307` |

| `DB\_NAME` | `open\_route` |



Os valores de usuário e senha devem corresponder às credenciais configuradas no MySQL instalado no computador.



\*\*Atenção:\*\* a porta `3307` é a porta de referência presente no modelo de configuração do projeto. Caso o MySQL esteja utilizando outra porta, ajuste a variável `DB\_PORT` para corresponder à porta real do servidor.



Não compartilhe o arquivo `.env`, pois ele pode conter senhas e chaves de acesso. O arquivo de configuração deve permanecer apenas no ambiente local.



\## 7. Preparar o banco de dados



O backend utiliza o MySQL para armazenar as informações do sistema.



\### 7.1. Iniciar o servidor MySQL



Antes de configurar o banco, verifique se o serviço do MySQL está em execução.



É possível consultar os serviços relacionados ao MySQL pelo PowerShell:



```powershell

Get-Service \*mysql\*

```



Se o serviço estiver parado, inicie-o pelo aplicativo de gerenciamento de serviços do Windows ou pelo MySQL instalado no computador.



\### 7.2. Criar o banco de dados



Abra uma conexão com o MySQL pelo terminal:



```powershell

mysql -u root -p -P 3307

```



Digite a senha do usuário quando solicitada.



Se o servidor estiver configurado em outra porta, substitua `3307` pela porta correspondente.



Depois de entrar no terminal do MySQL, execute:



```sql

CREATE DATABASE open\_route;

```



Para conferir se o banco foi criado:



```sql

SHOW DATABASES;

```



Para sair do terminal do MySQL:



```sql

EXIT;

```



\### 7.3. Criar as tabelas do sistema



A criação do banco de dados não cria automaticamente as tabelas necessárias para o funcionamento do OpenRoute.



É necessário executar o script SQL correspondente à versão atual do projeto, contendo a estrutura das tabelas utilizadas pelo backend.



\*\*Atenção:\*\* o repositório da branch `backend` utilizado como referência nesta documentação não disponibiliza um script completo de criação inicial de todas as tabelas. Portanto, não considere o banco pronto apenas por executar o comando `CREATE DATABASE`.



Antes de iniciar a API para utilizar as funcionalidades que acessam o banco, confirme com a equipe responsável pelo projeto qual é o script de criação do esquema correspondente à versão atual do backend.



Não utilize scripts de migração de versões antigas como se fossem scripts de criação inicial do banco.



\## 8. Iniciar o backend



Depois de configurar o ambiente virtual, instalar as dependências e preencher o arquivo `.env`, confirme que o terminal está na pasta `OpenRoute-backend` e que o ambiente virtual está ativado.



Execute:



```powershell

python -m flask --app app.main run --debug

```



O Flask iniciará o servidor de desenvolvimento. Por padrão, a API ficará disponível no endereço:



```text

http://127.0.0.1:5000

```



Mantenha esse terminal aberto enquanto estiver utilizando o backend. Se ele for fechado ou a execução for interrompida, o servidor deixará de funcionar.



Para interromper a execução, pressione:



```text

Ctrl + C

```



\## 9. Verificar se a API está funcionando



Com o backend em execução, abra outro terminal ou um navegador e acesse:



```text

http://127.0.0.1:5000/health

```



Essa rota é disponibilizada pelo backend para verificar seu funcionamento.



Também é possível realizar a consulta pelo PowerShell:



```powershell

Invoke-RestMethod http://127.0.0.1:5000/health

```



A resposta deve ser apresentada no terminal caso a rota esteja acessível.



\*\*Importante:\*\* conseguir acessar a rota de verificação não significa, por si só, que todas as funcionalidades estão operacionais. As operações que dependem do banco de dados e dos serviços externos também exigem que essas dependências estejam configuradas e disponíveis.



\## 10. Executar os testes



O projeto inclui o `pytest` entre as dependências do backend.



Para executar os testes automatizados, utilize:



```powershell

python -m pytest

```



O resultado será apresentado no terminal.



Caso não existam testes automatizados no diretório do projeto, o comando poderá informar que nenhum teste foi encontrado.



\## 11. Problemas comuns



\### O comando `python` não é reconhecido



Verifique se o Python foi instalado corretamente e se foi adicionado ao PATH do Windows.



Feche e abra novamente o PowerShell e execute:



```powershell

python --version

```



\### O ambiente virtual não ativa



Se o PowerShell bloquear a execução do script, execute:



```powershell

Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

```



Depois, tente novamente:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



\### O comando `pip install -r requirements.txt` apresenta erro



Confira se o ambiente virtual está ativado e se o terminal está na pasta que contém o arquivo `requirements.txt`.



Para verificar a localização atual:



```powershell

Get-Location

```



Para conferir se o arquivo existe:



```powershell

Test-Path .\\requirements.txt

```



\### A conexão com o banco de dados falha



Verifique:



\- Se o servidor MySQL está em execução.

\- Se o banco `open\_route` foi criado.

\- Se a porta configurada em `DB\_PORT` corresponde à porta utilizada pelo servidor.

\- Se o usuário e a senha configurados no `.env` estão corretos.

\- Se as tabelas necessárias foram criadas a partir do esquema correspondente à versão atual do projeto.



\### A API não inicia



Confira se:



\- O ambiente virtual está ativado.

\- As dependências foram instaladas.

\- O arquivo `.env` foi criado e está preenchido.

\- O comando foi executado na pasta raiz do backend.

\- A porta `5000` não está sendo utilizada por outro processo.



\### A API inicia, mas uma funcionalidade apresenta erro



Verifique a mensagem apresentada no terminal em que o Flask está sendo executado. Ela pode indicar se o problema está relacionado ao banco de dados, às configurações ou à comunicação com algum serviço externo.



\## 12. Finalização



Após concluir as etapas, o ambiente do backend estará preparado para execução, desde que o banco de dados e suas tabelas estejam devidamente configurados.



Para trabalhar com o projeto, mantenha o ambiente virtual ativado e inicie a API sempre que necessário:



```powershell

.\\venv\\Scripts\\Activate.ps1

python -m flask --app app.main run --debug

```



A instalação e execução do frontend estão descritas no documento `frontend.md`.



