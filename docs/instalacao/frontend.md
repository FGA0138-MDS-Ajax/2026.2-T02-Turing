

# Instalação e execução do frontend



Este documento apresenta as etapas necessárias para obter, configurar e executar o frontend do OpenRoute em um computador Windows.



O frontend é desenvolvido com Angular e utiliza TypeScript, HTML e CSS. Sua função é disponibilizar a interface por meio da qual os usuários acessam as funcionalidades do sistema.



O OpenRoute possui dois perfis de acesso: **ADM**, responsável pelas atividades administrativas, e **USUARIO**, correspondente ao perfil operacional utilizado pelo motorista.



## 1. Obter o código do frontend



O frontend deve ser obtido a partir da branch `front` do repositório. Não utilize a branch `main` como referência para esta instalação.



Abra o PowerShell na pasta em que deseja armazenar o projeto e execute:



```powershell

git clone --branch front --single-branch https://github.com/FGA0138-MDS-Ajax/2026.2-T02-Turing.git 2026.2-T02-Turing

```



Entre na pasta do repositório:



```powershell

cd .\\2026.2-T02-Turing

```



Confira se está utilizando a branch correta:



```powershell

git branch

```



A branch atual deve aparecer com um asterisco ao lado:



```text

* front

```



O código do frontend está dentro da pasta `frontend`. Entre nela:



```powershell

cd .\\frontend

```



Confira se os arquivos necessários estão disponíveis:



```powershell

Get-ChildItem

```



Entre os arquivos esperados estão `package.json` e `package-lock.json`.



## 2. Verificar o Node.js e o npm



O Angular utiliza o Node.js e o npm para executar a aplicação e gerenciar suas dependências.



Confira se ambos estão instalados:



```powershell

node --version

npm --version

```



O projeto utiliza Angular 19.2. Recomenda-se utilizar o Node.js 22 LTS para manter a compatibilidade com a versão do Angular utilizada.



Caso os comandos não sejam reconhecidos, confira as orientações de instalação do documento `ambiente.md`.



## 3. Instalar as dependências



O arquivo `package.json` contém as informações das bibliotecas necessárias para o funcionamento do frontend.



O arquivo `package-lock.json` registra as versões das dependências utilizadas pelo projeto.



Na pasta `frontend`, execute:



```powershell

npm ci

```



Esse comando instala as dependências utilizando as versões registradas no `package-lock.json`.



Aguarde a conclusão da instalação.



**Importante:** utilize `npm ci` para instalar as dependências em uma instalação limpa. Se o comando informar que não existe um `package-lock.json`, confira se você está na pasta correta e se os arquivos da branch `front` foram obtidos corretamente.



## 4. Configurar o endereço do backend



O frontend precisa conhecer o endereço em que o backend está sendo executado para realizar as requisições à API.



No projeto, essa configuração está no arquivo:



```text

src/app/config/api.config.ts

```



Abra o arquivo pelo PowerShell:



```powershell

notepad .\\src\\app\\config\\api.config.ts

```



Confira a configuração do endereço da API.



Para executar o frontend junto ao backend local, o endereço utilizado deve ser:



```text

http://127.0.0.1:5000

```



Se o arquivo já estiver configurado com esse endereço, não é necessário alterá-lo.



Caso esteja diferente, ajuste a configuração para apontar para o endereço em que o backend está sendo executado, preservando a estrutura e os nomes das constantes já existentes no arquivo.



Salve as alterações com `Ctrl + S`.



**Atenção:** o endereço configurado no frontend precisa corresponder ao endereço e à porta utilizados pelo backend. Se o backend estiver em outro endereço, a configuração também deverá ser ajustada.



## 5. Iniciar o backend



Antes de utilizar as funcionalidades do frontend que dependem da API, o backend precisa estar em execução.



Abra outro terminal do PowerShell, entre na pasta do backend e ative o ambiente virtual:



```powershell

cd C:\\Users\\Pessoal\\Documents\\OpenRoute-backend

.\\venv\\Scripts\\Activate.ps1

```



Inicie a API:



```powershell

python -m flask --app app.main run --debug

```



O backend deverá ficar disponível em:



```text

http://127.0.0.1:5000

```



Mantenha esse terminal aberto enquanto utilizar o frontend.



Caso o backend ainda não esteja configurado, consulte o documento `backend.md`.



## 6. Executar o frontend



Com as dependências instaladas e o endereço do backend configurado, volte ao terminal que está na pasta `frontend`.



Execute:



```powershell

npm start

```



O Angular iniciará o servidor de desenvolvimento.



Quando a compilação terminar, a aplicação estará disponível no endereço:



```text

http://localhost:4200

```



Abra esse endereço no navegador para acessar a interface do OpenRoute.



Mantenha o terminal aberto enquanto estiver utilizando a aplicação. Para interromper a execução, pressione:



```text

Ctrl + C

```



## 7. Verificar a comunicação com o backend



Com o frontend e o backend em execução:



1. Acesse `http://localhost:4200` no navegador.

2. Verifique se a interface do OpenRoute é carregada.

3. Acesse uma funcionalidade que realize uma requisição à API.

4. Observe se os dados são carregados ou se a operação é concluída corretamente.



Se a interface abrir, mas alguma funcionalidade apresentar erro, isso não significa necessariamente que o frontend esteja com problema. A falha também pode estar relacionada ao backend, ao banco de dados ou à comunicação entre as aplicações.



## 8. Problemas comuns



### O comando `node` ou `npm` não é reconhecido



Verifique se o Node.js foi instalado corretamente e se está disponível no PATH do Windows.



Feche e abra novamente o PowerShell e execute:



```powershell

node --version

npm --version

```



### O comando `npm ci` apresenta erro



Confira se o terminal está na pasta `frontend` e se os arquivos `package.json` e `package-lock.json` existem.



Para verificar a pasta atual:



```powershell

Get-Location

```



Para verificar a existência dos arquivos:



```powershell

Test-Path .\\package.json

Test-Path .\\package-lock.json

```



### A aplicação não inicia



Confira se:



- O Node.js e o npm estão instalados.

- As dependências foram instaladas com `npm ci`.

- O terminal está na pasta `frontend`.

- O comando `npm start` foi executado corretamente.

- A porta utilizada pelo servidor de desenvolvimento não está ocupada por outro processo.



### A interface abre, mas não consegue acessar a API



Confira:



- Se o backend está em execução.

- Se o endereço configurado em `src/app/config/api.config.ts` corresponde ao endereço do backend.

- Se o backend está acessível em `http://127.0.0.1:5000/health`.

- Se o terminal do backend apresenta alguma mensagem de erro.

- Se o navegador apresenta erros de comunicação na ferramenta de desenvolvedor, na aba Console ou Network.



### Erro de CORS



O CORS controla quais origens podem realizar requisições ao backend.



Se o navegador apresentar um erro relacionado ao CORS, confira a configuração de CORS no backend e verifique se a origem utilizada pelo frontend está autorizada.



Não tente corrigir esse problema alterando apenas o endereço da API no frontend, pois a autorização da origem é configurada no backend.



## 9. Finalização



Após concluir as etapas, o frontend estará disponível para utilização no navegador, desde que suas dependências estejam instaladas e o backend esteja acessível.



Para executar novamente o projeto, abra o PowerShell na pasta `frontend` e utilize:



```powershell

npm start

```



Lembre-se de manter o backend em execução em outro terminal para utilizar as funcionalidades que dependem da API.



