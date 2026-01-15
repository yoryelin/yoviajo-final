import logging
import sys
from app.config import settings

# Crear un logger centralizado
logger = logging.getLogger("yoviajo_api")

def setup_logging():
    """
    Configura el sistema de logging.
    """
    # Determinar nivel de log basado en debug
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    
    logger.setLevel(log_level)
    
    # Formato del log
    formatter = logging.Formatter(
        "%(asctime)s - [%(levelname)s] - %(filename)s:%(lineno)d - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    
    # Handler de consola
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    
    # Evitar duplicados si se llama varias veces
    if not logger.handlers:
        logger.addHandler(console_handler)

    logger.info(f"Logger initialized. Level: {logging.getLevelName(log_level)}")
