from sqlalchemy.orm import Session
from app.models.audit import AuditLog
import json
import logging

logger = logging.getLogger(__name__)

class AuditService:
    @staticmethod
    def log(db: Session, action: str, user_id: int = None, details: dict = None, ip_address: str = None):
        """
        Crea un registro de auditoría en la base de datos.
        Safe-fail: Si falla el log, no bloquea la operación principal, solo lo imprime en consola.
        """
        try:
            # Serializar detalles si existen
            details_json = details if details else {}
            
            # SAFE-GUARD: Convert objects like 'date' or 'datetime' to string to avoid JSON errors
            # Using json.loads/dumps trick to normalize
            try:
                details_json = json.loads(json.dumps(details_json, default=str))
            except Exception:
                # Fallback: if complex objects fail, convert only top level or just stringify the whole dict
                details_json = {"raw_error_data": str(details_json)}

            # Crear el objeto DB
            audit_entry = AuditLog(
                user_id=user_id,
                action=action,
                details=details_json,
                ip_address=ip_address
            )
            
            db.add(audit_entry)
            db.commit()
            db.refresh(audit_entry)
            
        except Exception as e:
            # En producción, esto debería ir a un sistema de monitoreo (Sentry/Datadog)
            logger.error(f"FALLO DE AUDITORÍA: {action} - {e}")
            # No hacemos raise para no romper el flujo del usuario
