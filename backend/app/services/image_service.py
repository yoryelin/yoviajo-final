import cloudinary
import cloudinary.uploader
from app.config import settings
from app.core.logger import logger

class ImageService:
    def __init__(self):
        try:
            # INTENTO 1: Configuración Manual (Más robusta)
            # Si existen las variables individuales, usarlas directamente
            c_name = settings.CLOUDINARY_CLOUD_NAME
            c_key = settings.CLOUDINARY_API_KEY
            c_secret = settings.CLOUDINARY_API_SECRET

            if c_name and c_key and c_secret:
                cloudinary.config(
                    cloud_name=c_name,
                    api_key=c_key,
                    api_secret=c_secret
                )
                self.enabled = True
                logger.info("ImageService initialized via individual keys.")
                return

            # INTENTO 2: Configuración por URL (Fallback)
            if settings.CLOUDINARY_URL:
                # Limpiar "basura" posible (comillas, espacios)
                clean_url = settings.CLOUDINARY_URL.strip().strip("'").strip('"')
                
                # Forzar prefijo si falta (aunque debería estar)
                if not clean_url.startswith("cloudinary://"):
                     # Tratamos de arreglarlo si es solo la parte de credenciales
                     if "@" in clean_url:
                         clean_url = f"cloudinary://{clean_url}"
                
                # Asignar a variable de entorno "falsa" para que la lib la lea bien
                import os
                os.environ["CLOUDINARY_URL"] = clean_url
                
                # Init vacio dispara la lectura de env
                cloudinary.config(secure=True)
                self.enabled = True
                logger.info("ImageService initialized via URL.")
            else:
                logger.warning("ImageService disabled: No credentials found.")
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
