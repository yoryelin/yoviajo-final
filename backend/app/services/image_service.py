import os
import cloudinary
import cloudinary.uploader
from app.config import settings
from app.core.logger import logger

class ImageService:
    def __init__(self):
        try:
            # Recuperar credenciales (Intentando Settings y luego os.environ directamente)
            c_name = settings.CLOUDINARY_CLOUD_NAME or os.environ.get("CLOUDINARY_CLOUD_NAME")
            c_key = settings.CLOUDINARY_API_KEY or os.environ.get("CLOUDINARY_API_KEY")
            c_secret = settings.CLOUDINARY_API_SECRET or os.environ.get("CLOUDINARY_API_SECRET")

            # DEBUG LOGS (Safe)
            logger.info(f"Cloudinary Init Check: Name={'OK' if c_name else 'MISSING'}, Key={'OK' if c_key else 'MISSING'}, Secret={'OK' if c_secret else 'MISSING'}")

            # INTENTO 1: Configuración con Keys Individuales
            if c_name and c_key and c_secret:
                # Limpiar posibles comillas residuales
                c_name = c_name.strip().strip("'").strip('"')
                c_key = c_key.strip().strip("'").strip('"')
                c_secret = c_secret.strip().strip("'").strip('"')

                cloudinary.config(
                    cloud_name=c_name,
                    api_key=c_key,
                    api_secret=c_secret
                )
                self.enabled = True
                logger.info("ImageService initialized via individual keys (Direct/Settings).")
                return

            # INTENTO 2: Configuración por URL (Fallback)
            # Nota: CLOUDINARY_URL podría haber sido borrada por config.py si estaba corrupta
            c_url = getattr(settings, "CLOUDINARY_URL", None) or os.environ.get("CLOUDINARY_URL")
            
            if c_url:
                # Limpiar "basura" posible (comillas, espacios)
                clean_url = c_url.strip().strip("'").strip('"')
                
                # Forzar prefijo si falta
                if not clean_url.startswith("cloudinary://") and "@" in clean_url:
                     clean_url = f"cloudinary://{clean_url}"
                
                # Re-check valid prefix
                if clean_url.startswith("cloudinary://"):
                    os.environ["CLOUDINARY_URL"] = clean_url
                    cloudinary.config(secure=True)
                    self.enabled = True
                    logger.info("ImageService initialized via URL.")
                    return
                else:
                    logger.warning(f"ImageService: CLOUDINARY_URL found but invalid format.")

            # Si llegamos aquí, falló todo
            logger.warning("ImageService disabled: No valid credentials found in Settings or Env.")
            self.enabled = False

        except Exception as e:
            logger.error(f"ImageService init error: {e}")
            self.enabled = False

    def upload_image(self, file_content, folder="yoviajo/profiles"):
        """
        Sube una imagen a Cloudinary.
        Retorna la URL segura (https) o None si falla.
        """
        if not self.enabled:
            logger.warning("Upload rejected: ImageService disabled")
            return None

        try:
            # Upload directo usando el SDK
            response = cloudinary.uploader.upload(
                file_content,
                folder=folder,
                resource_type="image"
            )
            # Retornar la URL segura
            return response.get("secure_url")
        except Exception as e:
            logger.error(f"Cloudinary upload failed: {e}")
            return None
