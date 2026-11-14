-- =====================================================================
-- EcoColeta Universitária - Consultas (SELECT)
-- Cada consulta tem um título em comentário e o requisito que atende.
-- =====================================================================

-- 1) Listar todos os pontos de coleta com os tipos aceitos (RF02)
SELECT  p.id, p.nome, p.cidade, p.horario,
        GROUP_CONCAT(t.nome, ', ') AS tipos_aceitos
FROM    pontos_coleta p
JOIN    ponto_tipo_item pt ON pt.ponto_id = p.id
JOIN    tipos_item t       ON t.id = pt.tipo_item_id
GROUP BY p.id, p.nome, p.cidade, p.horario
ORDER BY p.cidade, p.nome;

-- 2) Filtrar pontos por cidade e por tipo de item (RF02)
SELECT  p.nome, p.cidade, p.endereco
FROM    pontos_coleta p
JOIN    ponto_tipo_item pt ON pt.ponto_id = p.id
JOIN    tipos_item t       ON t.id = pt.tipo_item_id
WHERE   p.cidade = 'Cidade Exemplo'
  AND   t.nome   = 'Pilhas e baterias';

-- 3) Histórico de descartes de uma estudante (RF06)
SELECT  d.data_hora, t.nome AS item, d.quantidade, d.ponto_nome, d.observacao
FROM    descartes d
JOIN    usuarios  u ON u.id = d.usuario_id
JOIN    tipos_item t ON t.id = d.tipo_item_id
WHERE   u.email = 'ana@exemplo.com'
ORDER BY d.data_hora DESC;

-- 4) Relatório: total de itens por tipo, incluindo tipos sem descarte (RF07)
SELECT tipo, registros, total_itens
FROM   vw_relatorio_por_tipo
ORDER BY total_itens DESC, tipo;

-- 5) Quantidade de itens recebida por cada ponto de coleta
SELECT  p.nome AS ponto, COALESCE(SUM(d.quantidade), 0) AS itens_recebidos
FROM    pontos_coleta p
LEFT JOIN descartes d ON d.ponto_id = p.id
GROUP BY p.id, p.nome
ORDER BY itens_recebidos DESC;

-- 6) Ranking de estudantes por itens descartados
SELECT  u.nome, COUNT(d.id) AS registros, COALESCE(SUM(d.quantidade), 0) AS total_itens
FROM    usuarios u
LEFT JOIN descartes d ON d.usuario_id = u.id
WHERE   u.perfil = 'estudante'
GROUP BY u.id, u.nome
ORDER BY total_itens DESC;

-- 7) Descartes por mês
SELECT  strftime('%Y-%m', data_hora) AS mes,
        COUNT(*)                     AS registros,
        SUM(quantidade)              AS itens
FROM    descartes
GROUP BY mes
ORDER BY mes;

-- 8) Usuários que ainda não registraram nenhum descarte (subconsulta)
SELECT  nome, email
FROM    usuarios u
WHERE   NOT EXISTS (SELECT 1 FROM descartes d WHERE d.usuario_id = u.id);

-- 9) Pontos que NÃO aceitam pilhas e baterias (subconsulta)
SELECT  p.nome, p.cidade
FROM    pontos_coleta p
WHERE   p.id NOT IN (
            SELECT pt.ponto_id
            FROM   ponto_tipo_item pt
            JOIN   tipos_item t ON t.id = pt.tipo_item_id
            WHERE  t.nome = 'Pilhas e baterias');
