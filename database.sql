CREATE DATABASE IF NOT EXISTS open_route;

USE open_route;

CREATE TABLE perfis (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(40) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    descricao VARCHAR(255) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

CREATE TABLE usuarios (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    perfil_id BIGINT UNSIGNED NOT NULL,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(254) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(25) NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_acesso_em DATETIME NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_usuarios_perfis
        FOREIGN KEY (perfil_id) REFERENCES perfis (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE sessoes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NOT NULL,
    token_hash CHAR(64) NOT NULL,
    ip_origem VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    atividade_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expira_em DATETIME NOT NULL,
    revogada_em DATETIME NULL,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_sessoes_usuarios
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE enderecos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    logradouro VARCHAR(180) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    pais VARCHAR(80) NOT NULL DEFAULT 'Brasil',
    referencia VARCHAR(255) NULL,
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    validacao_status ENUM('PENDENTE', 'VALIDADO', 'FALHOU') NOT NULL DEFAULT 'PENDENTE',
    provedor_geocodificacao VARCHAR(50) NULL,
    geocodificado_em DATETIME NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT chk_enderecos_latitude
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_enderecos_longitude
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

CREATE TABLE pedidos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    cliente_id BIGINT UNSIGNED NOT NULL,
    endereco_id BIGINT UNSIGNED NOT NULL,
    criado_por_id BIGINT UNSIGNED NULL,
    descricao TEXT NULL,
    data_entrega DATE NOT NULL,
    janela_entrega_inicio TIME NULL,
    janela_entrega_fim TIME NULL,
    status ENUM(
        'PENDENTE',
        'PLANEJADO',
        'SAIU_PARA_ENTREGA',
        'EM_ANDAMENTO',
        'ENTREGUE',
        'FALHOU',
        'CANCELADO'
    ) NOT NULL DEFAULT 'PENDENTE',
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_pedidos_clientes
        FOREIGN KEY (cliente_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pedidos_enderecos
        FOREIGN KEY (endereco_id) REFERENCES enderecos (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_pedidos_criado_por
        FOREIGN KEY (criado_por_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT chk_pedidos_janela_entrega
        CHECK (
            janela_entrega_inicio IS NULL
            OR janela_entrega_fim IS NULL
            OR janela_entrega_fim >= janela_entrega_inicio
        )
);

CREATE TABLE historico_status_pedidos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    pedido_id BIGINT UNSIGNED NOT NULL,
    usuario_id BIGINT UNSIGNED NULL,
    status_anterior ENUM(
        'PENDENTE', 'PLANEJADO', 'SAIU_PARA_ENTREGA', 'EM_ANDAMENTO',
        'ENTREGUE', 'FALHOU', 'CANCELADO'
    ) NULL,
    status_novo ENUM(
        'PENDENTE', 'PLANEJADO', 'SAIU_PARA_ENTREGA', 'EM_ANDAMENTO',
        'ENTREGUE', 'FALHOU', 'CANCELADO'
    ) NOT NULL,
    observacao VARCHAR(500) NULL,
    registrado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_historico_pedidos
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_historico_usuarios
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE rotas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    motorista_id BIGINT UNSIGNED NOT NULL,
    criada_por_id BIGINT UNSIGNED NULL,
    nome VARCHAR(120) NULL,
    data_execucao DATE NOT NULL,
    status ENUM('RASCUNHO', 'CALCULADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'RASCUNHO',
    distancia_total_metros DECIMAL(13,2) NULL,
    tempo_estimado_segundos INT UNSIGNED NULL,
    geometria JSON NULL,
    provedor_calculo VARCHAR(50) NULL,
    calculada_em DATETIME NULL,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_rotas_motoristas
        FOREIGN KEY (motorista_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_rotas_criada_por
        FOREIGN KEY (criada_por_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE restricoes_operacionais (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    rota_id BIGINT UNSIGNED NOT NULL,
    janela_inicio TIME NULL,
    janela_fim TIME NULL,
    capacidade_maxima DECIMAL(12,3) NULL,
    unidade_capacidade VARCHAR(30) NULL,
    observacoes VARCHAR(500) NULL,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_restricoes_rotas
        FOREIGN KEY (rota_id) REFERENCES rotas (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT chk_restricoes_janela
        CHECK (janela_inicio IS NULL OR janela_fim IS NULL OR janela_fim >= janela_inicio),
    CONSTRAINT chk_restricoes_capacidade
        CHECK (capacidade_maxima IS NULL OR capacidade_maxima > 0)
);

CREATE TABLE rota_pedidos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    rota_id BIGINT UNSIGNED NOT NULL,
    pedido_id BIGINT UNSIGNED NOT NULL,
    ordem_parada SMALLINT UNSIGNED NOT NULL,
    chegada_prevista DATETIME NULL,
    saida_prevista DATETIME NULL,
    adicionada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_rota_pedidos_rotas
        FOREIGN KEY (rota_id) REFERENCES rotas (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_rota_pedidos_pedidos
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE ocorrencias (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    motorista_id BIGINT UNSIGNED NOT NULL,
    rota_id BIGINT UNSIGNED NULL,
    pedido_id BIGINT UNSIGNED NULL,
    descricao TEXT NOT NULL,
    data_ocorrencia DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolvida BOOLEAN NOT NULL DEFAULT FALSE,
    resolvida_em DATETIME NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_ocorrencias_motoristas
        FOREIGN KEY (motorista_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_ocorrencias_rotas
        FOREIGN KEY (rota_id) REFERENCES rotas (id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_ocorrencias_pedidos
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE alertas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    administrador_id BIGINT UNSIGNED NOT NULL,
    rota_id BIGINT UNSIGNED NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensagem TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_alertas_administradores
        FOREIGN KEY (administrador_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_alertas_rotas
        FOREIGN KEY (rota_id) REFERENCES rotas (id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE alertas_visualizacoes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    alerta_id BIGINT UNSIGNED NOT NULL,
    motorista_id BIGINT UNSIGNED NOT NULL,
    visualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_visualizacoes_alertas
        FOREIGN KEY (alerta_id) REFERENCES alertas (id)
        ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_visualizacoes_motoristas
        FOREIGN KEY (motorista_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE notificacoes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    pedido_id BIGINT UNSIGNED NOT NULL,
    cliente_id BIGINT UNSIGNED NOT NULL,
    mensagem TEXT NOT NULL,
    canal ENUM('INTERNO', 'EMAIL', 'SMS', 'WHATSAPP') NOT NULL DEFAULT 'INTERNO',
    status_envio ENUM('PENDENTE', 'ENVIADA', 'FALHOU') NOT NULL DEFAULT 'PENDENTE',
    provedor VARCHAR(60) NULL,
    identificador_externo VARCHAR(150) NULL,
    tentativas SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    enviada_em DATETIME NULL,
    erro_envio TEXT NULL,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notificacoes_pedidos
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_notificacoes_clientes
        FOREIGN KEY (cliente_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE auditoria_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NULL,
    acao VARCHAR(100) NOT NULL,
    entidade VARCHAR(100) NOT NULL,
    entidade_id VARCHAR(64) NULL,
    detalhes JSON NULL,
    ip_origem VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    registrado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_auditoria_usuarios
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE integracao_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    provedor VARCHAR(60) NOT NULL,
    servico VARCHAR(80) NOT NULL,
    endpoint VARCHAR(500) NULL,
    metodo_http ENUM('GET', 'POST', 'PUT', 'PATCH', 'DELETE') NULL,
    codigo_http SMALLINT UNSIGNED NULL,
    duracao_ms INT UNSIGNED NULL,
    sucesso BOOLEAN NOT NULL,
    mensagem_erro TEXT NULL,
    registrado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);
DROP TRIGGER IF EXISTS trg_auditoria_logs_bloquear_update;
DROP TRIGGER IF EXISTS trg_auditoria_logs_bloquear_delete;

DELIMITER $$
CREATE TRIGGER trg_auditoria_logs_bloquear_update
BEFORE UPDATE ON auditoria_logs
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Registros de auditoria sao imutaveis.';
END$$

CREATE TRIGGER trg_auditoria_logs_bloquear_delete
BEFORE DELETE ON auditoria_logs
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Registros de auditoria nao podem ser excluidos.';
END$$
DELIMITER ;

INSERT INTO perfis (codigo, nome, descricao)
SELECT 'ADMINISTRADOR', 'Administrador', 'Gerencia usuarios, pedidos, rotas, configuracoes e alertas.'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE codigo = 'ADMINISTRADOR')
UNION ALL
SELECT 'MOTORISTA', 'Motorista', 'Visualiza rotas, atualiza entregas e registra ocorrencias.'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE codigo = 'MOTORISTA')
UNION ALL
SELECT 'CLIENTE', 'Cliente', 'Acompanha pedidos, status de entrega e notificacoes.'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE codigo = 'CLIENTE')
UNION ALL
SELECT 'SISTEMA_EXTERNO_API', 'Sistema Externo/API', 'Perfil tecnico destinado a integracoes e comunicacao entre sistemas.'
WHERE NOT EXISTS (SELECT 1 FROM perfis WHERE codigo = 'SISTEMA_EXTERNO_API');
