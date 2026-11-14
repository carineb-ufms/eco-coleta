from pathlib import Path
from db import init_database


if __name__ == "__main__":
    init_database()
    print("Banco SQLite inicializado em:", Path(__file__).resolve().parent.parent / "banco-de-dados" / "ecocoleta.db")
