# Plan de Expansión Internacional: Brasil 🇧🇷

Este documento detalla la hoja de ruta técnica para adaptar "YoViajo" al mercado brasileño. El análisis de factibilidad indica una **Complejidad Media-Baja**, ya que la arquitectura actual soporta la mayoría de los cambios requeridos sin necesidad de reescritura.

## 1. Sistema de Pagos (Prioridad Alta) 💸

* **Situación Actual**: Integración exclusiva con MercadoPago Argentina (ARS).
* **Requerimiento**:
  * Configurar MercadoPago para aceptar **Reales (BRL)**.
  * Integrar **Pix** (método de pago dominante en Brasil).
* **Archivos Afectados**: `backend/app/services/payment_service.py`, `backend/app/config.py`.

## 2. Internacionalización (i18n) 🗣️

* **Situación Actual**: Textos en español "hardcoded" (fijos) en el código frontend y backend.
* **Requerimiento**:
  * Implementar una librería de i18n (ej: `react-i18next`).
  * Extraer todos los textos a archivos de recursos: `es.json` y `pt.json`.
  * Permitir cambio de idioma dinámico o por detección de ubicación.
* **Archivos Afectados**: Todos los componentes `.jsx` en `frontend/src`.

## 3. Identidad y Documentación 🆔

* **Situación Actual**: Validación de **DNI** (Documento Nacional de Identidad) argentino.
* **Requerimiento**:
  * Soportar formato **CPF** (Cadastro de Pessoas Físicas).
  * (Opcional) Adaptar validación de Licencia de Conducir (CNH en Brasil).
* **Archivos Afectados**: `backend/app/api/routes/auth.py`, `frontend/src/components/RegisterModal.jsx`.

## 4. Geolocalización y Mapas 📍

* **Situación Actual**: Filtro de búsqueda restringido a Argentina (`countrycodes: 'ar'`).
* **Requerimiento**:
  * Expandir el filtro de geocodificación a Brasil (`countrycodes: 'br,ar'`).
  * Validar zonas fronterizas si se permiten viajes internacionales.
* **Archivos Afectados**: `backend/app/utils/__init__.py` (o servicio de geocoding correspondiente).

## 5. Formatos Regionales 🔢

* **Situación Actual**:
  * Moneda: `$` (Pesos).
  * Teléfonos: `+54` hardcoded en validaciones/ejemplos.
* **Situación Actual**:
  * Moneda: `$` (Pesos).
  * Teléfonos: `+54` hardcoded en validaciones/ejemplos.
* **Requerimiento**:
  * Moneda: Mostrar `R$` para usuarios en Brasil.
  * Teléfonos: Soportar código `+55` y formato móvil brasilero (con el noveno dígito).
* **Archivos Afectados**: Utilidades de formateo en Frontend y validaciones en Backend.

## 6. Infraestructura y Dominios 🌐

* **Desarrollo Local**: El proyecto clonado (`YoViajoBrasil`) correrá inicialmente en tu máquina (`localhost`), totalmente separado de la versión argentina.
* **Piloto / Staging**: Se puede desplegar en Render gratuitamente usando un subdominio automático (ej: `yoviajo-brasil.onrender.com`). Esto permite probar en real sin gastar en dominios.
* **Producción**:
  * **Dominio**: Se requerirá registrar `yoviajo.com.br` (o usar un subdominio `br.yoviajo.com`).
  * **Hosting**: Se desplegará como una aplicación separada en Render (Nuevo Servicio Web).
  * **Configuración**: Las URLs de redirección (Login, Pagos) se configuran en las variables de entorno (`.env`), por lo que el cambio de `.ar` a `.br` es solo un ajuste de configuración, no de código.

---
**Estado del Proyecto**: 🟢 Factible. Arquitectura lista para escalar.
