# Modelo de Dados



## Visão geral



O banco de dados do OpenRoute utiliza MySQL para armazenar as informações necessárias ao funcionamento do sistema.



A estrutura é organizada em tabelas relacionadas entre si por meio de chaves primárias e estrangeiras, permitindo manter a integridade dos dados e estabelecer associações entre usuários, pedidos, endereços e rotas.



## Tabelas do banco de dados



O modelo de dados contempla as seguintes tabelas:



### 1. perfis



Armazena os perfis de acesso disponíveis no sistema.



Principais campos:



- `id`: identificador do perfil.

- `codigo`: código do perfil, como ADM ou USUARIO.

- `nome`: nome do perfil.

- `descricao`: descrição das permissões ou finalidade do perfil.



### 2. usuarios



Armazena os dados das contas cadastradas no sistema.



Principais campos:



- `id`: identificador do usuário.

- `perfil\_id`: identificador do perfil associado.

- `nome`: nome do usuário.

- `email`: endereço de e-mail.

- `senha\_hash`: representação protegida da senha.

- `telefone`: telefone do usuário.

- `ativo`: indica se a conta está ativa.

- `ultimo\_acesso\_em`: data e horário do último acesso.

- `criado\_em`: data de criação da conta.

- `atualizado\_em`: data da última atualização.



### 3. sessoes



Armazena informações relacionadas às sessões de acesso dos usuários.



Principais campos:



- `id`: identificador da sessão.

- `usuario\_id`: identificador do usuário associado.

- `token\_hash`: representação protegida do token da sessão.

- `ip\_origem`: endereço IP de origem.

- `user\_agent`: informações sobre o navegador ou dispositivo.

- `atividade\_em`: data e horário da última atividade.

- `expira\_em`: data e horário de expiração.

- `revogada\_em`: data e horário da revogação, quando existente.

- `criada\_em`: data de criação da sessão.



### 4. enderecos



Armazena os endereços utilizados nas entregas, incluindo suas informações geográficas.



Principais campos:



- `id`: identificador do endereço.

- `logradouro`: rua ou avenida.

- `numero`: número do imóvel.

- `complemento`: complemento do endereço.

- `bairro`: bairro.

- `cidade`: cidade.

- `estado`: unidade federativa.

- `cep`: Código de Endereçamento Postal.

- `pais`: país do endereço.

- `referencia`: informação adicional para localização.

- `latitude`: coordenada geográfica de latitude.

- `longitude`: coordenada geográfica de longitude.

- `validacao\_status`: situação da validação do endereço.

- `provedor\_geocodificacao`: serviço utilizado para obter as coordenadas.

- `geocodificado\_em`: data e horário da geocodificação.



As coordenadas são obtidas pelo processo de geocodificação do backend a partir das informações do endereço, não sendo necessário que o usuário as informe manualmente.



### 5. pedidos



Armazena os pedidos que representam as entregas a serem organizadas pelo sistema.



Principais campos:



- `id`: identificador do pedido.

- `endereco\_id`: identificador do endereço associado.

- `criado\_por\_id`: identificador do usuário responsável pela criação, quando informado.

- `descricao`: descrição adicional do pedido.

- `data\_entrega`: data prevista para a entrega.

- `janela\_entrega\_inicio`: horário inicial permitido para a entrega.

- `janela\_entrega\_fim`: horário final permitido para a entrega.

- `status`: situação atual do pedido.

- `criado\_em`: data de criação do registro.

- `atualizado\_em`: data da última atualização.



O status do pedido pode assumir os seguintes valores:



- `PENDENTE`

- `PLANEJADO`

- `SAIU\_PARA\_ENTREGA`

- `EM\_ANDAMENTO`

- `ENTREGUE`

- `FALHOU`

- `CANCELADO`



### 6. rotas



Armazena as informações das rotas calculadas e organizadas pelo sistema.



Principais campos:



- `id`: identificador da rota.

- `usuario\_id`: identificador do usuário associado à rota.

- `criada\_por\_id`: identificador do usuário responsável pela criação, quando informado.

- `nome`: nome da rota.

- `data\_execucao`: data prevista para execução.

- `status`: situação atual da rota.

- `distancia\_total\_metros`: distância total calculada, em metros.

- `tempo\_estimado\_segundos`: tempo estimado de execução, em segundos.

- `geometria`: representação geográfica do trajeto.

- `provedor\_calculo`: serviço utilizado no cálculo.

- `calculada\_em`: data e horário do cálculo.

- `criada\_em`: data de criação do registro.

- `atualizada\_em`: data da última atualização.



O status da rota pode assumir os valores:



- `RASCUNHO`

- `CALCULADA`

- `EM\_ANDAMENTO`

- `CONCLUIDA`

- `CANCELADA`



### 7. restricoes\_operacionais



Armazena as restrições associadas às rotas.



Principais campos:



- `id`: identificador da restrição.

- `rota\_id`: identificador da rota associada.

- `janela\_inicio`: horário inicial da restrição.

- `janela\_fim`: horário final da restrição.

- `observacoes`: informações adicionais.

- `criada\_em`: data de criação do registro.

- `atualizada\_em`: data da última atualização.



### 8. rota\_pedidos



É a tabela responsável por relacionar rotas e pedidos, permitindo registrar quais pedidos fazem parte de cada rota e em qual ordem devem ser atendidos.



Principais campos:



- `id`: identificador do registro.

- `rota\_id`: identificador da rota.

- `pedido\_id`: identificador do pedido.

- `ordem\_parada`: posição do pedido na sequência de atendimento.

- `chegada\_prevista`: horário previsto de chegada ao destino.

- `saida\_prevista`: horário previsto de saída do destino.

- `adicionada\_em`: data de inclusão do pedido na rota.



## Relacionamentos entre as tabelas



Os relacionamentos são estabelecidos por meio de chaves estrangeiras:



- **perfis e usuarios:** um perfil pode estar associado a vários usuários, enquanto cada usuário possui um perfil.

- **usuarios e sessoes:** um usuário pode possuir várias sessões de acesso.

- **enderecos e pedidos:** um endereço pode estar associado a vários pedidos, enquanto cada pedido possui um endereço.

- **usuarios e pedidos:** um usuário pode ser associado à criação de vários pedidos.

- **usuarios e rotas:** um usuário pode estar associado a várias rotas, tanto como usuário responsável pela rota quanto como responsável por sua criação.

- **rotas e restricoes\_operacionais:** uma rota pode possuir várias restrições operacionais.

- **rotas e pedidos:** o relacionamento é realizado pela tabela intermediária `rota\_pedidos`, que registra os pedidos associados a cada rota e a ordem de atendimento.



## Integridade dos dados



O banco utiliza chaves primárias para identificar individualmente os registros e chaves estrangeiras para estabelecer os relacionamentos entre as tabelas.



Também são definidas restrições de unicidade para evitar, por exemplo, o cadastro de usuários com e-mails repetidos e a repetição da mesma posição de parada dentro de uma rota.

