import cloudinary
import cloudinary.uploader
from app.config import settings
from app.core.logger import logger

class StorageService:
    def __init__(self):
        try:
            cloudinary.config( 
                cloud_name = settings.CLOUDINARY_CLOUD_NAME, 
                api_key = settings.CLOUDINARY_API_KEY, 
                api_secret = settings.CLOUDINARY_API_SECRET,
                secure = True
            )
            self.enabled = bool(settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY)
            if not self.enabled:
                missing = []
                if not settings.CLOUDINARY_CLOUD_NAME: missing.append("CLOUDINARY_CLOUD_NAME")
                if not settings.CLOUDINARY_API_KEY: missing.append("CLOUDINARY_API_KEY")
                if not settings.CLOUDINARY_API_SECRET: missing.append("CLOUDINARY_API_SECRET")
                logger.warning(f"StorageService disabled. Missing vars: {', '.join(missing)}")
        except Exception as e:
            logger.error(f"StorageService init error: {e}")
            self.enabled = False

    def upload_file(self, file_content, filename: str) -> str:
        """
        Sube un archivo a Cloudinary y retorna la URL segura.
        file_content: bytes o file-like object.
        """
        if not self.enabled:
            logger.warning("StorageService disabled. Cannot upload.")
            return None

        try:
            # Upload to Cloudinary
            response = cloudinary.uploader.upload(
                file_content, 
                public_id=f"yoviajo/profiles/{filename.split('.')[0]}",
                unique_filename=True,
                overwrite=True
            )
            return response.get("secure_url")
        except Exception as e:
            logger.error(f"Failed to upload file to Cloudinary: {e}")
            return None
