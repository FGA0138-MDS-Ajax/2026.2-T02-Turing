# Open Route — Backend Flask

## Escopo de perfis
O sistema possui somente dois perfis: `ADM` e `USUARIO`. O antigo perfil Motorista foi incorporado a `USUARIO`; não existe perfil Cliente. O ADM pode cadastrar, listar, consultar perfil e remover contas USUARIO. Não existe endpoint de edição de usuário.

## Configuração
1. Para banco novo, execute `database.sql` no MySQL. Se o banco antigo já existir, faça backup e execute `MIGRACAO_ADM_USUARIO.sql` uma única vez.
2. Copie `.env.example` para `.env` e configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.
3. Instale dependências: `pip install -r requirements.txt`.
4. Execute `python -m flask --app app.main run --debug`.

## API de autenticação e administração
- `POST /auth/login` — `{ "email": "...", "senha": "..." }`; retorna token Bearer.
- `POST /auth/logout` — revoga a sessão.
- `GET /usuarios` — lista usuários (ADM).
- `POST /usuarios` — cria usuário com perfil USUARIO (ADM). Campos: `nome`, `email`, `senha` (mínimo 8 caracteres), `telefone` opcional.
- `GET /usuarios/{id}` — consulta perfil (ADM).
- `DELETE /usuarios/{id}` — desativa conta USUARIO e revoga suas sessões (ADM). A operação é lógica para preservar histórico operacional.
- `GET /pedidos` — lista entregas para o painel operacional, exigindo sessão válida.
- `POST /restricoes` — cadastra restrição de janela de horário vinculada a uma rota (USUARIO). Campos: `rota_id`, `janela_inicio` e `janela_fim` (`HH:MM[:SS]`), `observacoes` opcional.
- `GET /restricoes` — lista as restrições do usuário autenticado; aceita `?rota_id=` para filtrar por rota (USUARIO).
- `GET /restricoes/{id}` — consulta uma restrição (somente se pertence a rota do usuário autenticado).
- `PUT /restricoes/{id}` — edita janela/observações; o vínculo `rota_id` é imutável (USUARIO).
- `DELETE /restricoes/{id}` — remove uma restrição do usuário autenticado (USUARIO).

Envie `Authorization: Bearer <token>` nas rotas protegidas. Para criar o primeiro ADM, configure `ADM_NOME`, `ADM_EMAIL` e `ADM_SENHA` no `.env` e execute `python criar_adm.py`.

## Janelas de tempo
`POST /calcular-rota` aceita, para cada destino, `janela_inicio_min` e `janela_fim_min`, expressos em minutos desde a partida. Quando qualquer janela for informada, todas as paradas (exceto a origem/índice zero) precisam ter início e fim. O otimizador considera espera quando chega antes do início e rejeita sequências que ultrapassem o fim da janela.

## Observações
A interface Angular de ADM está na pasta `frontend/` desta entrega como conjunto de arquivos de integração, não como projeto Angular completo (o ZIP frontend recebido originalmente continha apenas arquivos soltos).
