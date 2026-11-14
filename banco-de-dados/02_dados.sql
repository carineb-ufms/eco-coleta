-- =====================================================================
-- EcoColeta Universitária - Inserção de dados (INSERT)
-- ATENÇÃO: todos os dados abaixo são FICTÍCIOS, só para testar o banco.
-- Os hashes de senha são textos de exemplo (não correspondem a senhas reais).
-- =====================================================================

PRAGMA foreign_keys = ON;

-- Tipos de item (os mesmos usados na aplicação web)
INSERT INTO tipos_item (nome) VALUES
    ('Celulares e tablets'),
    ('Carregadores e cabos'),
    ('Fones de ouvido'),
    ('Pilhas e baterias'),
    ('Pen drives e cartões de memória'),
    ('Notebooks e acessórios'),
    ('Outros pequenos eletrônicos');

-- Usuários (o primeiro é administrador, como na aplicação)
INSERT INTO usuarios (nome, email, sal, senha_hash, perfil, criado_em) VALUES
    ('Administradora Exemplo', 'admin@exemplo.com', 'sal-exemplo-1', 'hash-de-exemplo-1', 'admin',     '2026-09-01 09:00:00'),
    ('Ana Estudante',          'ana@exemplo.com',   'sal-exemplo-2', 'hash-de-exemplo-2', 'estudante', '2026-09-02 10:30:00'),
    ('Bruno Estudante',        'bruno@exemplo.com', 'sal-exemplo-3', 'hash-de-exemplo-3', 'estudante', '2026-09-03 14:15:00'),
    ('Carla Estudante',        'carla@exemplo.com', 'sal-exemplo-4', 'hash-de-exemplo-4', 'estudante', '2026-09-10 08:45:00');

-- Pontos de coleta (os mesmos 3 pontos de exemplo da aplicação)
INSERT INTO pontos_coleta (nome, cidade, endereco, horario, exemplo) VALUES
    ('Ponto de exemplo 1', 'Cidade Exemplo',       'Rua Exemplo, 100 - Centro',            'Seg a sex, 8h às 17h',  1),
    ('Ponto de exemplo 2', 'Cidade Exemplo',       'Avenida Exemplo, 200 - Bairro Modelo', 'Seg a sáb, 9h às 18h',  1),
    ('Ponto de exemplo 3', 'Outra Cidade Exemplo', 'Praça Exemplo, 300',                   'Seg a sex, 10h às 16h', 1);

-- Quais tipos cada ponto aceita (relacionamento N:N)
-- Ponto 1: celulares, carregadores, fones
INSERT INTO ponto_tipo_item (ponto_id, tipo_item_id)
SELECT 1, id FROM tipos_item
WHERE nome IN ('Celulares e tablets', 'Carregadores e cabos', 'Fones de ouvido');
-- Ponto 2: pilhas, pen drives, outros
INSERT INTO ponto_tipo_item (ponto_id, tipo_item_id)
SELECT 2, id FROM tipos_item
WHERE nome IN ('Pilhas e baterias', 'Pen drives e cartões de memória', 'Outros pequenos eletrônicos');
-- Ponto 3: celulares, notebooks, pilhas
INSERT INTO ponto_tipo_item (ponto_id, tipo_item_id)
SELECT 3, id FROM tipos_item
WHERE nome IN ('Celulares e tablets', 'Notebooks e acessórios', 'Pilhas e baterias');

-- Descartes registrados pelos estudantes
INSERT INTO descartes (usuario_id, tipo_item_id, ponto_id, ponto_nome, quantidade, observacao, data_hora) VALUES
    (2, 1, 1, 'Ponto de exemplo 1', 1, 'Celular antigo sem uso',      '2026-09-15 11:00:00'),
    (2, 2, 1, 'Ponto de exemplo 1', 3, NULL,                           '2026-09-15 11:02:00'),
    (2, 4, 2, 'Ponto de exemplo 2', 6, 'Pilhas de controle remoto',    '2026-10-02 16:20:00'),
    (3, 3, 1, 'Ponto de exemplo 1', 2, NULL,                           '2026-09-20 09:40:00'),
    (3, 6, 3, 'Ponto de exemplo 3', 1, 'Notebook com tela quebrada',   '2026-10-05 15:10:00'),
    (3, 4, 3, 'Ponto de exemplo 3', 4, NULL,                           '2026-10-05 15:12:00'),
    (4, 5, 2, 'Ponto de exemplo 2', 5, 'Pen drives antigos',           '2026-10-18 13:30:00'),
    (4, 1, 3, 'Ponto de exemplo 3', 2, NULL,                           '2026-11-03 10:05:00');
