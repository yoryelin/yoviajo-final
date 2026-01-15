# 🧠 Arquitectura Fusionada: Sistema de Estados y Eventos "YoViajo!"

Este documento consolida la visión proactiva con un **Modelo de Estados y Eventos**, definiendo la interacción no como publicaciones sueltas, sino como **Intenciones de Viaje** que evolucionan.

---

## 1. Modelo Mental: "La Intención de Viaje"

Todo aviso (sea Oferta o Demanda) es una **Intención** viva que atraviesa un ciclo de vida.

### 📍 Máquina de Estados (Ciclo de Vida)

El núcleo del sistema gestiona estas transiciones:

1. **🔵 PUBLICADO:** La intención es visible. El algoritmo empieza a trabajar.
2. **🟡 EN BÚSQUEDA (Matching):** El sistema detecta candidatos.
    * *Alta afinidad:* Notificación inmediata.
    * *Media afinidad:* Sugerencia pasiva.
3. **🟠 EN CONVERSACIÓN (Pre-Match):** Las partes chatean anónimamente para acordar detalles (Punto de encuentro).
4. **🟣 PRE-ACORDADO:** Una parte envió propuesta formal, esperando aceptación.
5. **🟢 CONFIRMADO (Handshake):** **Doble Check**. Ambos aceptaron. Se bloquean cupos. Se revela contacto directo (WhatsApp).
6. **⚫ REALIZADO / EXPIRADO:** Fin del ciclo. Habilita reputación.

---

## 2. Motor de Matching Progresivo (No Binario)

El sistema no busca coincidencias exactas ("si/no"), sino **Grados de Afinidad**:

| Nivel de Afinidad | Criterios (Ejemplo) | Acción del Sistema |
| :--- | :--- | :--- |
| **Alta 🔥** | Desvío < 500m + Hora exacta | **Notificación Push Inmediata** |
| **Media ⚠️** | Desvío < 2km + Diferencia 30 min | **Aviso en App ("Posible Match")** |
| **Baja ❄️** | Desvío grande o Ventana horaria amplia | Solo visible en Búsqueda Manual |

> **Clave:** Normalizar todo (Texto o Geo) a coordenadas + radio de tolerancia.

---

## 3. Flujo de Interacción y Eventos

### Fase A: Negociación Asistida (Chat)

El chat es **obligatorio** previo al cierre para resolver la incertidumbre de la "última milla".

* **Funciones:**
  * Mensajes libres.
  * **Mensajes Guiados:** "¿Te queda bien la Terminal?", "¿Aceptas mascotas?".
  * **Compartir Referencia:** Enviar ubicación de un "Punto de Encuentro" predefinido (Monumento, Plaza).

### Fase B: El Acuerdo (Bilateral)

Para evitar malentendidos ("Yo pensé que venías"):

1. Usuario A pulsa **"Proponer Viaje"** (condiciones finales).
2. Estado pasa a `PRE-ACORDADO`.
3. Usuario B recibe alerta y debe pulsar **"Confirmar Viaje"**.
4. Estado pasa a `CONFIRMADO`.

### Fase C: Post-Confirmación

* Se revela enlace `wa.me` (WhatsApp) para coordinación fina de último minuto.
* Bloqueo de nuevos matches para esos asientos.
* **Temporizador:** El viaje se marca automáticamente como `REALIZADO` X horas después de la hora pactada (a menos que se reporte problema).

---

## 4. Tipos de Notificaciones (Eventos)

El sistema notifica **cambios de estado**, no spam.

* 🔔 **"Nuevo Match Alto"** (Alguien va a tu destino exacto).
* 🔔 **"Nueva Propuesta"** (Alguien quiere viajar contigo).
* 🔔 **"Viaje Confirmado"** (Tu lugar está asegurado).
* 🔔 **"Recordatorio"** (Tu viaje sale en 1 hora).

---

## 5. Resumen de Ventajas

1. **Menos Fricción:** El matching progresivo evita el "miedo al vacío" (siempre hay opciones, aunque sean de afinidad media).
2. **Mayor Seguridad:** El paso de "Conversación" a "Confirmado" filtromalentendidos.
3. **Orden:** Los estados claros reducen la ansiedad del usuario ("¿Me aceptaron? ¿Viene o no viene?").
