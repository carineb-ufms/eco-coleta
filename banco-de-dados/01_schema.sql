-- =====================================================================
-- EcoColeta Universitária - Esquema do banco de dados (SQLite)
-- Cria as tabelas, chaves primárias, chaves estrangeiras e restrições.
-- Modelo normalizado até a 3ª Forma Normal (3FN).
-- =====================================================================

-- O SQLite só respeita chaves estrangeiras com esta opção ligada.
PRAGMA foreign_keys = ON;

-- Apaga em ordem inversa das dependências (permite rodar o arquivo de novo).
DROP VIEW  IF EXISTS vw_relatorio_por_tipo;
DROP TABLE IF EXISTS descartes;
DROP TABLE IF EXISTS ponto_tipo_item;
DROP TABLE IF EXISTS pontos_coleta;
DROP TABLE IF EXISTS tipos_item;
DROP TABLE IF EXISTS usuarios;

-- ---------------------------------------------------------------------
-- USUARIOS: estudantes e administradores (RF01)
-- ---------------------------------------------------------------------
CREATE TABLE usuarios (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT    NOT NULL CHECK (length(trim(nome)) > 0),
    email       TEXT    NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
    sal         TEXT    NOT NULL,                 -- sal usado no hash da senha
    senha_hash  TEXT    NOT NULL,                 -- nunca guardamos a senha pura
    perfil      TEXT    NOT NULL DEFAULT 'estudante'
                        CHECK (perfil IN ('estudante', 'admin')),
    criado_em   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- TIPOS_ITEM: tipos de lixo eletrônico (tabela de domínio)
-- Evita repetir o texto do tipo em várias tabelas (normalização).
-- ---------------------------------------------------------------------
CREATE TABLE tipos_item (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    nome  TEXT NOT NULL UNIQUE CHECK (length(trim(nome)) > 0)
);

-- ---------------------------------------------------------------------
-- PONTOS_COLETA: locais que recebem o material (RF02 e RF04)
-- ---------------------------------------------------------------------
CREATE TABLE pontos_coleta (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL CHECK (length(trim(nome)) > 0),
    cidade     TEXT    NOT NULL CHECK (length(trim(cidade)) > 0),
    endereco   TEXT    NOT NULL,
    horario    TEXT    NOT NULL,
    exemplo    INTEGER NOT NULL DEFAULT 0 CHECK (exemplo IN (0, 1)),  -- 1 = dado fictício
    criado_em  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------------------------------------------------------------------
-- PONTO_TIPO_ITEM: relacionamento N:N entre pontos e tipos de item
-- (um ponto aceita vários tipos; um tipo é aceito por vários pontos)
-- ---------------------------------------------------------------------
CREATE TABLE ponto_tipo_item (
    ponto_id      INTEGER NOT NULL,
    tipo_item_id  INTEGER NOT NULL,
    PRIMARY KEY (ponto_id, tipo_item_id),                       -- chave primária composta
    FOREIGN KEY (ponto_id)     REFERENCES pontos_coleta (id) ON DELETE CASCADE,
    FOREIGN KEY (tipo_item_id) REFERENCES tipos_item (id)    ON DELETE RESTRICT
);

-- ---------------------------------------------------------------------
-- DESCARTES: registros feitos pelos estudantes (RF03, RF06 e RF07)
-- ---------------------------------------------------------------------
CREATE TABLE descartes (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id    INTEGER NOT NULL,
    tipo_item_id  INTEGER NOT NULL,
    ponto_id      INTEGER,                    -- pode ficar vazio se o ponto for excluído
    ponto_nome    TEXT    NOT NULL,           -- cópia do nome, para o histórico não se perder
    quantidade    INTEGER NOT NULL CHECK (quantidade BETWEEN 1 AND 99),
    observacao    TEXT,
    data_hora     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id)   REFERENCES usuarios (id)      ON DELETE CASCADE,
    FOREIGN KEY (tipo_item_id) REFERENCES tipos_item (id)    ON DELETE RESTRICT,
    FOREIGN KEY (ponto_id)     REFERENCES pontos_coleta (id) ON DELETE SET NULL
);

-- Índices para acelerar as consultas mais usadas.
CREATE INDEX idx_pontos_cidade     ON pontos_coleta (cidade);
CREATE INDEX idx_descartes_usuario ON descartes (usuario_id);
CREATE INDEX idx_descartes_tipo    ON descartes (tipo_item_id);
CREATE INDEX idx_descartes_ponto   ON descartes (ponto_id);

-- ---------------------------------------------------------------------
-- VIEW: relatório básico do administrador (RF07)
-- Mostra todos os tipos, inclusive os que ainda não tiveram descarte.
-- ---------------------------------------------------------------------
CREATE VIEW vw_relatorio_por_tipo AS
SELECT  t.nome                          AS tipo,
        COUNT(d.id)                     AS registros,
        COALESCE(SUM(d.quantidade), 0)  AS total_itens
FROM    tipos_item t
LEFT JOIN descartes d ON d.tipo_item_id = t.id
GROUP BY t.id, t.nome;
