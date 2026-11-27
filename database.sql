
-- OpenRoute: script de criacao inicial do banco de dados.
-- Compatibilidade prevista: MariaDB 10.4+ / MySQL 8.0.16+.
--
-- ATENCAO: execute somente em um banco novo e vazio.
-- Este script NAO atualiza a estrutura de um banco existente.
-- Nao use DROP DATABASE nem execute este script no seu banco atual
-- para aplicar mudancas. Migracoes devem ser feitas separadamente.
--
-- Escopo: perfis ADM e USUARIO, sessoes, enderecos,
-- rotas calculadas e paradas das rotas.

CREATE DATABASE IF NOT EXISTS open_route;

USE open_route;

-- Perfis
CREATE TABLE perfis (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    codigo VARCHAR(40) NOT NULL,
    nome VARCHAR(80) NOT NULL,
    descricao VARCHAR(255) NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_perfis_codigo (codigo)
);

-- Usuarios
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
    UNIQUE KEY uq_usuarios_email (email),
    CONSTRAINT fk_usuarios_perfis
        FOREIGN KEY (perfil_id) REFERENCES perfis (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Sessoes autenticadas
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
    UNIQUE KEY uq_sessoes_token (token_hash),
    CONSTRAINT fk_sessoes_usuarios
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE CASCADE
);

-- Enderecos cadastrados pelos motoristas
CREATE TABLE enderecos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NOT NULL,
    logradouro VARCHAR(180) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NOT NULL,
    estado CHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    pais VARCHAR(80) NOT NULL DEFAULT 'Brasil',
    referencia VARCHAR(255) NULL,
    janela_inicio TIME NULL,
    janela_fim TIME NULL,
    latitude DECIMAL(10,7) NULL,
    longitude DECIMAL(10,7) NULL,
    validacao_status ENUM('PENDENTE', 'VALIDADO', 'FALHOU')
        NOT NULL DEFAULT 'PENDENTE',
    provedor_geocodificacao VARCHAR(50) NULL,
    geocodificado_em DATETIME NULL,
    criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY ix_enderecos_usuario_id (usuario_id),
    CONSTRAINT fk_enderecos_usuarios
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON DELETE RESTRICT,
    CONSTRAINT chk_enderecos_janela
        CHECK (
            (janela_inicio IS NULL AND janela_fim IS NULL)
            OR
            (
                janela_inicio IS NOT NULL
                AND janela_fim IS NOT NULL
                AND janela_fim >= janela_inicio
            )
        ),
    CONSTRAINT chk_enderecos_latitude
        CHECK (latitude IS NULL OR latitude BETWEEN -90 AND 90),
    CONSTRAINT chk_enderecos_longitude
        CHECK (longitude IS NULL OR longitude BETWEEN -180 AND 180)
);

-- Rotas calculadas
CREATE TABLE rotas (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    usuario_id BIGINT UNSIGNED NOT NULL,
    criada_por_id BIGINT UNSIGNED NULL,
    nome VARCHAR(120) NULL,
    data_execucao DATE NOT NULL,
    status ENUM(
        'RASCUNHO',
        'CALCULADA',
        'EM_ANDAMENTO',
        'CONCLUIDA',
        'CANCELADA'
    ) NOT NULL DEFAULT 'RASCUNHO',
    distancia_total_metros DECIMAL(13,2) NULL,
    tempo_estimado_segundos INT UNSIGNED NULL,
    geometria JSON NULL,
    provedor_calculo VARCHAR(50) NULL,
    calculada_em TIMESTAMP NULL DEFAULT NULL,
    criada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_rotas_usuarios
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_rotas_criada_por
        FOREIGN KEY (criada_por_id) REFERENCES usuarios (id)
        ON UPDATE CASCADE ON DELETE SET NULL
);

-- Paradas de cada rota.
-- A origem utiliza ordem_parada = 0.
-- As entregas utilizam ordem_parada = 1, 2, 3...
-- Os dados do endereco sao preservados no momento do calculo.
CREATE TABLE rota_enderecos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    rota_id BIGINT UNSIGNED NOT NULL,
    endereco_id BIGINT UNSIGNED NULL,
    ordem_parada SMALLINT NOT NULL,
    logradouro VARCHAR(180) NOT NULL,
    numero VARCHAR(20) NOT NULL,
    complemento VARCHAR(100) NULL,
    bairro VARCHAR(100) NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    cep VARCHAR(9) NOT NULL,
    pais VARCHAR(80) NOT NULL,
    referencia VARCHAR(255) NULL,
    latitude DECIMAL(10,7) NOT NULL,
    longitude DECIMAL(10,7) NOT NULL,
    janela_inicio TIME NULL,
    janela_fim TIME NULL,
    chegada_prevista TIMESTAMP NULL DEFAULT NULL,
    saida_prevista TIMESTAMP NULL DEFAULT NULL,
    adicionada_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_rota_enderecos_ordem (rota_id, ordem_parada),
    KEY ix_rota_enderecos_endereco_id (endereco_id),
    CONSTRAINT fk_rota_enderecos_rotas
        FOREIGN KEY (rota_id) REFERENCES rotas (id)
        ON DELETE CASCADE,
    CONSTRAINT fk_rota_enderecos_enderecos
        FOREIGN KEY (endereco_id) REFERENCES enderecos (id)
        ON DELETE SET NULL,
    CONSTRAINT chk_rota_enderecos_janela
        CHECK (
            (janela_inicio IS NULL AND janela_fim IS NULL)
            OR
            (
                janela_inicio IS NOT NULL
                AND janela_fim IS NOT NULL
                AND janela_fim >= janela_inicio
            )
        )
);

-- Perfis iniciais do sistema
INSERT INTO perfis (codigo, nome, descricao)
SELECT
    'ADM',
    'Administrador',
    'Gerencia as contas de usuarios do sistema.'
WHERE NOT EXISTS (
    SELECT 1 FROM perfis WHERE codigo = 'ADM'
)
UNION ALL
SELECT
    'USUARIO',
    'Usuario',
    'Utiliza as funcionalidades operacionais do Open Route.'
WHERE NOT EXISTS (
    SELECT 1 FROM perfis WHERE codigo = 'USUARIO'
);