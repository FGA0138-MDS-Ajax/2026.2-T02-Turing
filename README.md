# Open Route — Backend Flask

## Escopo de perfis
O sistema possui somente dois perfis: `ADM` e `USUARIO`. O antigo perfil Motorista foi incorporado a `USUARIO`; não existe perfil Cliente. O ADM pode cadastrar, listar, consultar, editar e remover contas USUARIO.

## Configuração
1. Para banco novo, execute `database.sql` no MySQL. Se o banco antigo já existir, faça backup e execute `MIGRACAO_ADM_USUARIO.sql` uma única vez.
2. Copie `.env.example` para `.env` e configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` e `DB_NAME`.
3. Instale dependências: `pip install -r requirements.txt`.
4. Execute `python -m flask --app app.main run --debug`.

## API de autenticação e administração
- `POST /auth/login` — `{ "email": "...", "senha": "..." }`; retorna token Bearer. Sessões expiram por inatividade (`SESSAO_IDLE_MINUTOS`) e por duração máxima (`SESSAO_DURACAO_HORAS`).
- `POST /auth/logout` — revoga a sessão.
- `GET /usuarios` — lista usuários (ADM).
- `POST /usuarios` — cria usuário com perfil USUARIO (ADM). Campos: `nome`, `email`, `senha` (mínimo 8 caracteres), `telefone` opcional.
- `GET /usuarios/{id}` — consulta perfil (ADM).
- `PUT /usuarios/{id}` — edita usuário (ADM). Campos opcionais: `nome`, `email`, `telefone`, `senha` (mínimo 8), `ativo`. O ADM não pode desativar a própria conta.
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

## Documentação

[Documento de visão](https://docs.google.com/document/d/108L0faapmcmAy5MJK7_qShOT1ENTuuP5/edit)

[Documento de arquitetura](https://docs.google.com/document/d/1HGeXzP9B5Apm4zyVWTtlkK5UOrv09t0c/edit)

## Observações
A interface Angular de ADM está na pasta `frontend/` desta entrega como conjunto de arquivos de integração, não como projeto Angular completo (o ZIP frontend recebido originalmente continha apenas arquivos soltos).

Atualmente se usa a ferramenta MkDocs para gerar sua documentação baseado nos seus arquivos markdowns, vocês podem achar mais instruções sobre o MkDocs através do link da documentação da ferramenta: [https://www.mkdocs.org/](https://www.mkdocs.org/).

Também é usado uma "sub-ferramenta" do MkDocs para sua estilização, o Material Theme, que pode ser consultado através do link: [https://squidfunk.github.io/mkdocs-material/](https://squidfunk.github.io/mkdocs-material/).

Este repositório também conta com uma pipeline de automatização de deploy do seu conteúdo MkDocs, para que a cada commit feito na main, a pipeline gere uma versão atualizada da sua documentação em minutos. Vale ressaltar que é importante realizar uma configuração para que tudo funcione da forma correta, as instruções são as seguintes:

* Acesse as configurações do repositório;
* Procure a aba de "Pages"
* Em "Source" escolha a opção "Deploy from a branch";
* Em "Branch" escolha "gh-pages";
* Clique em salvar e pronto;

Após essas etapas de configuração, o seu GitPages deve funcionar normalmente.
