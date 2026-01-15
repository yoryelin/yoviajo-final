from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    """
    Test básico para verificar que la API responde.
    Útil para CI/CD smoke test.
    """
    response = client.get("/")
    # Si la raiz no tiene endpoint, probar docs o healthcheck
    # Asumiendo que /api/rides existe y requiere auth, probamos algo publico o un 401/404 esperado
    assert response.status_code in [200, 404] 

def test_docs_accessible():
    """
    Verificar que la documentación Swagger carga.
    """
    response = client.get("/docs")
    assert response.status_code == 200
