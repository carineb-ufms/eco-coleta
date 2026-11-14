import os
import sqlite3
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "banco-de-dados" / "ecocoleta.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_database():
    schema_path = BASE_DIR / "banco-de-dados" / "01_schema.sql"
    if not schema_path.exists():
        raise FileNotFoundError(f"Schema não encontrado: {schema_path}")

    conn = get_connection()
    try:
        sql = schema_path.read_text(encoding="utf-8")
        conn.executescript(sql)
        conn.commit()
    finally:
        conn.close()
