

# Testes do sistema



## 1. Objetivo



Este documento apresenta os procedimentos utilizados para verificar o funcionamento do OpenRoute, identificar falhas e avaliar se os componentes do sistema executam suas responsabilidades conforme esperado.



Os testes abrangem o backend, a comunicação com o banco de dados, as integrações externas e a interface do frontend.



É importante diferenciar os testes automatizados, executados por ferramentas de teste, das verificações manuais, realizadas por meio da utilização da aplicação.



## 2. Ambiente de testes



Para executar os testes do backend, são utilizadas as seguintes ferramentas:



| Ferramenta | Finalidade |
|---|---|
| Python | Executar o código do backend. |
| pytest | Executar os testes automatizados. |
| MySQL | Disponibilizar o banco de dados utilizado pelo sistema. |
| Flask | Executar a API durante as verificações funcionais. |


Para as verificações do frontend, são utilizados:



| Ferramenta | Finalidade |
|---|---|
| Node.js | Ambiente de execução do frontend. |
| npm | Gerenciar as dependências do projeto. |
| Angular | Executar a aplicação web. |
| Navegador | Verificar a interface e o comportamento da aplicação. |


## 3. Testes automatizados do backend



O backend utiliza o `pytest` como ferramenta para execução dos testes automatizados.



Os testes devem ser executados na raiz do projeto backend, com o ambiente virtual ativado e as dependências instaladas.



### 3.1. Acessar o projeto



Abra o PowerShell e entre na pasta do backend:



```powershell

cd C:\\Users\\Pessoal\\Documents\\OpenRoute-backend

```



Ative o ambiente virtual:



```powershell

.\\venv\\Scripts\\Activate.ps1

```



Confira se o ambiente virtual está ativo. O terminal deverá apresentar `(venv)` no início da linha.



### 3.2. Verificar a sintaxe dos arquivos Python



Para verificar se os arquivos Python podem ser compilados sem apresentar erros de sintaxe, execute:



```powershell

python -m compileall -q app tests

```



Esse comando verifica os arquivos dos diretórios `app` e `tests`.



Se não houver erros de compilação, o comando será concluído sem apresentar mensagens de erro.



Essa verificação não substitui os testes funcionais: ela verifica a compilação dos arquivos, não se todas as funcionalidades produzem os resultados esperados.



### 3.3. Executar os testes automatizados



Na raiz do backend, execute:



```powershell

pytest -q

```



O pytest localizará e executará os testes reconhecidos no projeto.



A opção `-q` apresenta um resumo dos resultados, facilitando a identificação de testes aprovados e reprovados.



Quando todos os testes forem aprovados, o resultado deverá indicar a quantidade de testes executados e a ausência de falhas.



### 3.4. Interpretar os resultados



Durante a execução, podem ocorrer diferentes resultados:



| Resultado | Significado |
|---|---|
| Passed | O teste foi executado e aprovado. |
| Failed | O teste foi executado, mas o resultado não correspondeu ao esperado. |
| Error | Ocorreu um erro durante a execução do teste. |
| Skipped | O teste foi ignorado por alguma condição definida. |


Caso algum teste apresente falha, consulte a mensagem apresentada pelo pytest para identificar o arquivo, a função e a condição que causaram o problema.



## 4. Resultados de testes registrados



O relatório de correções do OpenRoute registra a execução dos seguintes procedimentos:



| Procedimento | Resultado registrado |

|---|---|
| `python -m compileall -q app tests` | Concluído sem erros. |
| `pytest -q` | 16 testes aprovados. |


Esses resultados correspondem à execução registrada no relatório de correções disponibilizado para o projeto.



A quantidade de testes aprovados pode mudar conforme alterações no código e nos testes. Por isso, é necessário executar novamente os comandos no código atual para verificar seu estado.



## 5. Verificações funcionais do backend



Além dos testes automatizados, o backend pode ser verificado por meio de requisições HTTP à API.



### 5.1. Verificar a disponibilidade da API



Inicie o backend:



```powershell

python -m flask --app app.main run --debug

```



Com o servidor em execução, abra outro terminal e execute:



```powershell

Invoke-RestMethod http://127.0.0.1:5000/health

```



A rota `/health` permite verificar se a API está acessível.



### 5.2. Verificar a geocodificação



A geocodificação é responsável por converter informações textuais de endereço em coordenadas geográficas.



Durante a verificação, devem ser observados os seguintes aspectos:



- O endereço informado é enviado corretamente ao backend.

- O backend realiza a consulta ao serviço de geocodificação.

- Quando a consulta é bem-sucedida, são obtidas latitude e longitude.

- Quando ocorre uma falha, o sistema deve tratar a resposta sem assumir que o endereço foi validado.



O usuário informa os dados do endereço, não sendo necessário preencher manualmente latitude e longitude.



### 5.3. Verificar o cálculo de rotas



O cálculo de rotas deve ser verificado utilizando destinos que possuam coordenadas geográficas válidas.



Devem ser observados os seguintes aspectos:



- A API recebe os pontos necessários ao cálculo.

- O sistema verifica se existe a quantidade mínima de destinos exigida.

- O backend consulta o OSRM para obter informações de deslocamento.

- O resultado apresenta a sequência de atendimento calculada.

- As informações de distância e tempo são retornadas quando disponíveis.

- O tratamento alternativo utilizado quando o OSRM falha deve ser verificado.



O backend possui um mecanismo de aproximação baseado em Haversine para situações em que a consulta de matriz ao OSRM falha. Essa aproximação não equivale a um trajeto real calculado por uma segunda API de roteamento.



## 6. Verificações do banco de dados



As verificações do banco de dados devem confirmar se as informações são armazenadas e consultadas corretamente.



Com o MySQL em execução, conecte-se ao banco:



```powershell

mysql -u root -p -P 3307

```



Selecione o banco:



```sql

USE open\_route;

```



Consulte as tabelas disponíveis:



```sql

SHOW TABLES;

```



Também podem ser realizadas consultas para verificar a existência dos registros.



Por exemplo:



```sql

SELECT * FROM usuarios;

```



```sql

SELECT * FROM enderecos;

```



```sql

SELECT * FROM rotas;

```



As consultas devem ser realizadas considerando os dados existentes no ambiente de testes.



**Atenção:** não utilize comandos de exclusão ou alteração de registros em um banco com dados importantes durante a execução de verificações.



## 7. Verificações manuais do frontend



As verificações manuais permitem avaliar se a interface apresenta os dados corretamente e se as ações realizadas pelo usuário produzem os resultados esperados.



Para executá-las, o backend e o frontend devem estar configurados e disponíveis.



Inicie o frontend na pasta `frontend`:



```powershell

npm start

```



Acesse:



```text

http://localhost:4200

```



Durante a utilização da aplicação, podem ser verificadas as seguintes situações:



| Verificação | Resultado esperado |
|---|---|
| Abertura da aplicação | A interface deve ser carregada no navegador. |
| Acesso às funcionalidades disponíveis | As telas devem apresentar os recursos correspondentes ao perfil de acesso. |
| Gerenciamento de destinos | As operações disponíveis devem permitir trabalhar com os dados dos endereços. |
| Visualização de mapas | Os recursos de mapa devem apresentar as informações geográficas recebidas pela aplicação. |
| Comunicação com a API | As requisições devem alcançar o backend e receber respostas compatíveis com as operações solicitadas. |
| Exibição de erros | Problemas nas operações devem ser apresentados ou tratados sem interromper indevidamente a aplicação. |


Essas verificações são procedimentos manuais. Sua descrição não significa que todas as funcionalidades listadas estejam implementadas ou tenham sido aprovadas em uma execução de testes.



## 8. Verificações de integração



Os testes de integração verificam a comunicação entre diferentes partes do sistema.



No OpenRoute, devem ser observadas principalmente as seguintes integrações:



### 8.1. Frontend e backend



Verificar se:



- O frontend utiliza o endereço correto da API.

- As requisições são enviadas aos endpoints correspondentes.

- As respostas do backend são interpretadas corretamente.

- Os erros retornados pela API são tratados pela interface.



### 8.2. Backend e banco de dados



Verificar se:



- A aplicação consegue estabelecer conexão com o MySQL.

- As consultas retornam os dados esperados.

- As operações de persistência funcionam corretamente.

- Os relacionamentos entre as tabelas são respeitados.



### 8.3. Backend e serviços externos



Verificar se:



- O backend consegue consultar o Nominatim para geocodificação.

- O backend consegue consultar o OSRM para obter informações de roteamento.

- As respostas recebidas são tratadas corretamente.

- As falhas de comunicação são tratadas sem interromper indevidamente a aplicação.



## 9. Funcionalidades que exigem testes adicionais



A existência de uma estrutura no banco de dados ou de uma funcionalidade prevista no planejamento não significa que ela esteja completamente implementada.



O relatório de correções do projeto identifica funcionalidades que ainda exigem implementação ou validação adicional, entre elas:



- Autenticação e gerenciamento de sessões.

- Cadastro, edição e exclusão de usuários.

- Associação e gerenciamento de perfis.

- Operações completas de cadastro, listagem e edição de entregas.

- Endpoints de gerenciamento de restrições operacionais.

- Integração completa da visualização de mapas com o contrato do backend.

- Melhorias de desempenho da visualização de mapas.

- Implementação de um segundo provedor de roteamento como alternativa ao OSRM.

- Verificação das medidas de segurança e proteção de dados conforme a LGPD.



Esses itens não devem ser considerados aprovados apenas pela execução dos testes automatizados já registrados.



## 10. Registro dos resultados



Para acompanhar a qualidade do sistema, recomenda-se registrar os resultados das execuções de testes.



O registro pode conter:



| Informação | Descrição |
|---|---|
| Data da execução | Dia em que os testes foram realizados. |
| Versão do código | Branch e identificação da versão testada. |
| Procedimento | Comando ou funcionalidade verificada. |
| Resultado | Aprovado, reprovado ou não executado. |
| Problemas encontrados | Descrição das falhas identificadas. |
| Responsável | Integrante responsável pela execução. |


Esse registro facilita a comparação dos resultados entre diferentes versões do sistema e permite acompanhar a correção de problemas.



## 11. Considerações finais



Os testes são importantes para verificar se os componentes do OpenRoute funcionam de maneira adequada e se a comunicação entre frontend, backend, banco de dados e serviços externos ocorre conforme esperado.



A execução dos testes automatizados auxilia na identificação de erros no código, enquanto as verificações manuais e de integração permitem avaliar o comportamento da aplicação em situações próximas à utilização real.



Os resultados devem sempre corresponder à versão efetivamente testada.



