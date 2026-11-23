

# API de Destinos



## Visão geral



A API de destinos é responsável pelo cadastro, consulta, atualização e exclusão dos endereços utilizados nas operações de entrega do OpenRoute.



Os destinos são armazenados na tabela `enderecos` do banco de dados e possuem informações de endereço e coordenadas geográficas.



## Endpoints disponíveis



A API disponibiliza os seguintes endpoints:



| Método HTTP | Endpoint | Descrição |
|---|---|---|
| POST | `/destinos/` | Cadastra um novo destino. |
| GET | `/destinos/` | Lista os destinos cadastrados. |
| PUT | `/destinos/{destino\_id}` | Atualiza os dados de um destino. |
| DELETE | `/destinos/{destino\_id}` | Exclui um destino. |


## Detalhamento dos endpoints



### 1. Cadastrar destino



- **Método:** POST

- **Endpoint:** `/destinos/`

- **Descrição:** recebe os dados de um endereço, realiza sua geocodificação e armazena o destino no banco de dados.

- **Resposta de sucesso:** HTTP 201.



### 2. Listar destinos



- **Método:** GET

- **Endpoint:** `/destinos/`

- **Descrição:** retorna a lista de destinos cadastrados.

- **Resposta de sucesso:** HTTP 200.



### 3. Atualizar destino



- **Método:** PUT

- **Endpoint:** `/destinos/{destino\_id}`

- **Descrição:** atualiza as informações de um destino identificado pelo seu ID. Quando os campos do endereço são alterados, a geocodificação é realizada novamente.

- **Resposta de sucesso:** HTTP 200.

- **Destino não encontrado:** HTTP 404.



### 4. Excluir destino



- **Método:** DELETE

- **Endpoint:** `/destinos/{destino\_id}`

- **Descrição:** exclui o destino identificado pelo seu ID.

- **Resposta de sucesso:** HTTP 204.

- **Destino não encontrado:** HTTP 404.



## Dados dos destinos



Os registros de destinos possuem os seguintes campos:



| Campo | Descrição |
|---|---|
| id | Identificador do destino. |
| logradouro | Nome da rua ou avenida. |
| numero | Número do endereço. |
| complemento | Complemento do endereço. |
| bairro | Bairro do destino. |
| cidade | Cidade do destino. |
| estado | Unidade federativa. |
| cep | Código de Endereçamento Postal. |
| pais | País do endereço. |
| referencia | Informação adicional para localização. |
| latitude | Coordenada geográfica de latitude. |
| longitude | Coordenada geográfica de longitude. |
| validacao\_status | Situação da validação do endereço. |
| provedor\_geocodificacao | Serviço utilizado na geocodificação. |
| geocodificado\_em | Data e horário da geocodificação. |


## Geocodificação



O cadastro de um destino aciona o serviço de geocodificação do backend, responsável por obter as coordenadas geográficas a partir do endereço informado.



Quando informações relevantes do endereço são alteradas, o sistema realiza novamente esse procedimento.



O status de validação pode assumir os valores:



- `PENDENTE`

- `VALIDADO`

- `FALHOU`



## Observações



Os dados enviados e retornados pelos endpoints são estruturados conforme os schemas de criação, atualização e resposta definidos no backend.



