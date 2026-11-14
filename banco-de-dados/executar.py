"""
Cria o banco EcoColeta (SQLite) e executa os arquivos SQL na ordem,
mostrando o resultado de cada comando no terminal.

Uso (dentro da pasta do projeto):
    python banco-de-dados/executar.py     # recria o banco do zero e roda tudo
Não precisa instalar nada: o módulo sqlite3 já vem com o Python.
"""
import os
import sqlite3
import sys

PASTA = os.path.dirname(os.path.abspath(__file__))
ARQUIVO_DB = os.path.join(PASTA, "ecocoleta.db")


def ler(nome):
    with open(os.path.join(PASTA, nome), encoding="utf-8") as f:
        return f.read()


def tabela(colunas, linhas):
    """Imprime o resultado de uma consulta como uma tabela de texto."""
    texto = [[("" if v is None else str(v)) for v in linha] for linha in linhas]
    larguras = [len(c) for c in colunas]
    for linha in texto:
        for i, v in enumerate(linha):
            larguras[i] = max(larguras[i], len(v))
    corte = "+-" + "-+-".join("-" * w for w in larguras) + "-+"
    print(corte)
    print("| " + " | ".join(c.ljust(w) for c, w in zip(colunas, larguras)) + " |")
    print(corte)
    for linha in texto:
        print("| " + " | ".join(v.ljust(w) for v, w in zip(linha, larguras)) + " |")
    print(corte)
    print(f"({len(texto)} linha{'s' if len(texto) != 1 else ''})")


def executar_comandos(con, sql):
    """Executa um comando por vez e mostra o título (comentário) e o resultado."""
    buffer, titulo, comentario_anterior = "", "", False
    for linha in sql.splitlines():
        if not buffer.strip() and linha.strip().startswith("--"):
            texto = linha.strip().lstrip("-").strip()
            # o título é a PRIMEIRA linha de cada bloco de comentário
            if texto and not texto.startswith("=") and not comentario_anterior:
                titulo = texto
            comentario_anterior = bool(texto) and not texto.startswith("=")
            continue
        comentario_anterior = False
        buffer += linha + "\n"
        if sqlite3.complete_statement(buffer):
            comando = buffer.strip()
            buffer = ""
            if comando.upper().startswith("PRAGMA"):
                con.execute(comando)
                continue
            print(f"\n>>> {titulo}")
            cur = con.execute(comando)
            if cur.description:  # é uma consulta (SELECT)
                tabela([d[0] for d in cur.description], cur.fetchall())
            else:                # INSERT / UPDATE / DELETE
                print(f"OK ({cur.rowcount} linha(s) afetada(s))")
    con.commit()


# Comandos que DEVEM falhar, para provar que as restrições funcionam.
TESTES_RESTRICOES = [
    ("E-mail repetido (UNIQUE)",
     "INSERT INTO usuarios (nome, email, sal, senha_hash) VALUES ('Outra Ana', 'ana@exemplo.com', 's', 'h')"),
    ("E-mail inválido (CHECK)",
     "INSERT INTO usuarios (nome, email, sal, senha_hash) VALUES ('Teste', 'email-sem-arroba', 's', 'h')"),
    ("Perfil inexistente (CHECK)",
     "INSERT INTO usuarios (nome, email, sal, senha_hash, perfil) VALUES ('Teste', 't@exemplo.com', 's', 'h', 'chefe')"),
    ("Quantidade zero (CHECK)",
     "INSERT INTO descartes (usuario_id, tipo_item_id, ponto_id, ponto_nome, quantidade) VALUES (2, 1, 1, 'x', 0)"),
    ("Usuário inexistente (chave estrangeira)",
     "INSERT INTO descartes (usuario_id, tipo_item_id, ponto_id, ponto_nome, quantidade) VALUES (999, 1, 1, 'x', 1)"),
    ("Apagar tipo de item em uso (ON DELETE RESTRICT)",
     "DELETE FROM tipos_item WHERE nome = 'Celulares e tablets'"),
]


def testar_restricoes(con):
    print("\n" + "=" * 70)
    print("TESTE DAS RESTRIÇÕES (cada comando abaixo deve ser rejeitado)")
    print("=" * 70)
    for descricao, comando in TESTES_RESTRICOES:
        try:
            con.execute(comando)
            con.rollback()
            print(f"[FALHOU O TESTE] {descricao}: o banco aceitou o comando!")
        except sqlite3.Error as erro:
            con.rollback()
            print(f"[OK] {descricao}\n     rejeitado: {erro}")


def main():
    # Sempre começa do zero, assim o resultado é o mesmo toda vez.
    if os.path.exists(ARQUIVO_DB):
        os.remove(ARQUIVO_DB)
    con = sqlite3.connect(ARQUIVO_DB)
    con.execute("PRAGMA foreign_keys = ON")

    print("=" * 70 + "\n1) CRIANDO AS TABELAS (01_schema.sql)\n" + "=" * 70)
    con.executescript(ler("01_schema.sql"))
    print("Tabelas criadas:", ", ".join(
        r[0] for r in con.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")))

    print("\n" + "=" * 70 + "\n2) INSERINDO OS DADOS (02_dados.sql)\n" + "=" * 70)
    con.executescript(ler("02_dados.sql"))
    for nome in ["usuarios", "tipos_item", "pontos_coleta", "ponto_tipo_item", "descartes"]:
        n = con.execute(f"SELECT COUNT(*) FROM {nome}").fetchone()[0]
        print(f"{nome}: {n} registros")

    print("\n" + "=" * 70 + "\n3) CONSULTAS (03_consultas.sql)\n" + "=" * 70)
    executar_comandos(con, ler("03_consultas.sql"))

    print("\n" + "=" * 70 + "\n4) INSERT, UPDATE e DELETE (04_atualizacao_remocao.sql)\n" + "=" * 70)
    executar_comandos(con, ler("04_atualizacao_remocao.sql"))

    testar_restricoes(con)
    con.close()
    print(f"\nBanco gerado em: {ARQUIVO_DB}")


if __name__ == "__main__":
    main()
