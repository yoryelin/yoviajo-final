
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base
from app.api.deps import get_current_user

# 1. Base de Datos de Prueba (En Memoria - Se borra al terminar)
# Usamos SQLite en memoria para velocidad y aislamiento
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool, # Necesario para SQLite en memoria
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 2. Fixture de Base de Datos
@pytest.fixture(scope="function")
def db_session():
    # Crear tablas
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # Borrar tablas después de cada test
        Base.metadata.drop_all(bind=engine)

# 3. Fixture de Cliente (Simula el Navegador/API)
@pytest.fixture(scope="function")
def client(db_session):
    # Sobrescribir la dependencia get_db para usar la DB de prueba
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()
            
    app.dependency_overrides[get_db] = override_get_db
    
    # Crear cliente
    with TestClient(app) as c:
        yield c
        
    # Limpiar overrides
    app.dependency_overrides.clear()
