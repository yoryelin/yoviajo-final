import cloudinary
import cloudinary.uploader
from app.config import settings
from app.core.logger import logger

class ImageService:
    def __init__(self):
        try:
            # Cloudinary se autoconfigura si encuentra CLOUDINARY_URL en env
            # Pero podemos forzar chequeo
            if not settings.CLOUDINARY_URL:
                logger.warning("ImageService disabled: CLOUDINARY_URL not found.")
                self.enabled = False
            else:
                self.enabled = True
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
