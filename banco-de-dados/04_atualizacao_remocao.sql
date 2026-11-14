-- =====================================================================
-- EcoColeta Universitária - Inserção, atualização e remoção (INSERT, UPDATE, DELETE)
-- Este arquivo roda DEPOIS dos anteriores e mostra o efeito de cada comando.
-- =====================================================================

PRAGMA foreign_keys = ON;

-- 1) INSERT: administrador cadastra um novo ponto de coleta (RF04)
INSERT INTO pontos_coleta (nome, cidade, endereco, horario)
VALUES ('Biblioteca Central (exemplo)', 'Cidade Exemplo', 'Rua da Biblioteca, 10', 'Seg a sex, 7h às 19h');

-- 2) INSERT: o novo ponto passa a aceitar pilhas e celulares
INSERT INTO ponto_tipo_item (ponto_id, tipo_item_id)
SELECT p.id, t.id
FROM   pontos_coleta p, tipos_item t
WHERE  p.nome = 'Biblioteca Central (exemplo)'
  AND  t.nome IN ('Pilhas e baterias', 'Celulares e tablets');

-- 3) INSERT: estudante registra um novo descarte (RF03)
INSERT INTO descartes (usuario_id, tipo_item_id, ponto_id, ponto_nome, quantidade, observacao)
SELECT u.id, t.id, p.id, p.nome, 2, 'Carregadores quebrados'
FROM   usuarios u, tipos_item t, pontos_coleta p
WHERE  u.email = 'ana@exemplo.com'
  AND  t.nome  = 'Carregadores e cabos'
  AND  p.nome  = 'Ponto de exemplo 1';

-- 4) UPDATE: administrador altera o horário de um ponto (RF04)
UPDATE pontos_coleta
SET    horario = 'Seg a sex, 9h às 15h'
WHERE  nome = 'Ponto de exemplo 1';

-- 5) UPDATE: corrige a quantidade de um descarte
UPDATE descartes
SET    quantidade = 4, observacao = 'Quantidade corrigida pela estudante'
WHERE  usuario_id = (SELECT id FROM usuarios WHERE email = 'ana@exemplo.com')
  AND  observacao = 'Carregadores quebrados';

-- 6) Conferindo o ponto alterado e o novo ponto
SELECT id, nome, horario FROM pontos_coleta ORDER BY id;

-- 7) DELETE: remove um tipo aceito de um ponto
DELETE FROM ponto_tipo_item
WHERE  ponto_id = (SELECT id FROM pontos_coleta WHERE nome = 'Ponto de exemplo 2')
  AND  tipo_item_id = (SELECT id FROM tipos_item WHERE nome = 'Outros pequenos eletrônicos');

-- 8) DELETE: exclui o ponto 3. Os descartes dele NÃO são apagados:
--    o campo ponto_id vira vazio (ON DELETE SET NULL) e ponto_nome preserva o histórico.
DELETE FROM pontos_coleta WHERE nome = 'Ponto de exemplo 3';

-- 9) Conferindo o histórico depois da exclusão do ponto 3
SELECT id, ponto_id, ponto_nome, quantidade
FROM   descartes
WHERE  ponto_nome = 'Ponto de exemplo 3';

-- 10) DELETE: remove a estudante Carla e, em cascata, os descartes dela (ON DELETE CASCADE)
DELETE FROM usuarios WHERE email = 'carla@exemplo.com';

-- 11) Conferindo que os descartes dela também foram removidos
SELECT COUNT(*) AS descartes_da_carla
FROM   descartes
WHERE  usuario_id NOT IN (SELECT id FROM usuarios);

-- 12) Totais finais por tipo (view)
SELECT tipo, total_itens FROM vw_relatorio_por_tipo ORDER BY total_itens DESC, tipo;
