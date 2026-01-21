import os
import resend
from app.config import settings
from app.core.logger import logger

class EmailService:
    def __init__(self):
        try:
            resend.api_key = settings.RESEND_API_KEY
            self.enabled = bool(settings.RESEND_API_KEY)
            if not self.enabled:
                logger.warning("EmailService disabled: RESEND_API_KEY not found.")
        except Exception as e:
            logger.error(f"EmailService init error: {e}")
            self.enabled = False

    def send_welcome_email(self, user_name: str, user_email: str, role: str):
        """
        Envía un correo de bienvenida al registrarse.
        """
        if not self.enabled:
            logger.info(f"Skipping welcome email to {user_email} (Service disabled)")
            return

        subject = "¡Bienvenido a YoViajo! 🚀"
        if role == 'C':
            role_msg = "como Conductor"
            color = "#0891b2" # Cyan
        else:
            role_msg = "como Pasajero"
            color = "#be185d" # Pink

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px; border-radius: 12px;">
            <div style="background-color: #0f172a; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Yo<span style="color: {color};">Viajo</span>!</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0;">
                <h2 style="color: #1e293b;">¡Hola, {user_name}! 👋</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                    Gracias por unirte a la mejor comunidad de carpooling <strong style="color: {color};">{role_msg}</strong>.
                </p>
                
                <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 14px;"><strong>Próximos pasos:</strong></p>
                    <ul style="color: #475569; padding-left: 20px;">
                        <li>Completa tu perfil al 100%</li>
                        <li>{'Publica tu primer viaje' if role == 'C' else 'Busca tu próximo destino'}</li>
                        <li>Verifica tu seguridad</li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://yoviajo.com.ar" style="background-color: {color}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Ir a la App
                    </a>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #94a3b8; font-size: 12px;">
                <p>© 2026 YoViajo Team. Buenos Aires, Argentina.</p>
            </div>
        </div>
        """

        try:
            params = {
                "from": settings.FROM_EMAIL,
                "to": [user_email],
                "subject": subject,
                "html": html_content,
            }

            email = resend.Emails.send(params)
            logger.info(f"Welcome email sent to {user_email}: {email}")
            return email
        except Exception as e:
            logger.error(f"Failed to send welcome email: {e}")
            return None

    def send_recovery_email(self, user_email: str, recovery_token: str):
        """
        Envía un correo de recuperación de contraseña con un link.
        """
        if not self.enabled:
            logger.info("Skipping recovery email (Service disabled)")
            return

        subject = "Recupera tu contraseña - YoViajo"
        # En producción esto sería https://yoviajo.com.ar/reset-password?token=...
        recovery_link = f"https://yoviajo-frontend.onrender.com/reset-password?token={recovery_token}"

        html_content = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
            <div style="background-color: white; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center;">
                <h2 style="color: #1e293b;">¿Olvidaste tu contraseña? 🔐</h2>
                <p style="color: #475569;">
                    No te preocupes. Haz clic en el botón de abajo para crear una nueva.
                </p>
                
                <div style="margin: 30px 0;">
                    <a href="{recovery_link}" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                        Restablecer Contraseña
                    </a>
                </div>
                
                <p style="color: #94a3b8; font-size: 13px;">
                    Si no solicitaste esto, ignora este correo. El enlace expira en 30 minutos.
                </p>
            </div>
        </div>
        """

        try:
            params = {
                "from": settings.FROM_EMAIL,
                "to": [user_email],
                "subject": subject,
                "html": html_content,
            }

            email = resend.Emails.send(params)
            logger.info(f"Recovery email sent to {user_email}: {email}")
            return email
        except Exception as e:
            logger.error(f"Failed to send recovery email: {e}")
            return None
