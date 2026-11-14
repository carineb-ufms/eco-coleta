from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import get_connection

app = FastAPI(title="EcoColeta API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "service": "api"}


@app.get("/api/usuarios")
def listar_usuarios():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM usuarios ORDER BY id").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@app.get("/api/pontos")
def listar_pontos():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM pontos_coleta ORDER BY id").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


@app.get("/api/relatorio")
def relatorio():
    conn = get_connection()
    try:
        rows = conn.execute("SELECT * FROM vw_relatorio_por_tipo ORDER BY tipo_item").fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api.app:app", host="0.0.0.0", port=8001, reload=False)
