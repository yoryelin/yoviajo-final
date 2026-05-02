# ⚖️ Estrategia Legal y Defensa del Modelo - YoViajo

## 1. Naturaleza Jurídica y Marco Normativo de Referencia (Argentina)

**YoViajo** se constituye como una plataforma de intermediación tecnológica bajo el modelo de **Economía Colaborativa**. El proyecto se fundamenta jurídicamente en los siguientes pilares de la legislación argentina:

### 1.1. Encuadre en el "Transporte Benévolo" (Art. 1282 CCC)
El **Código Civil y Comercial de la Nación** distingue claramente entre el transporte oneroso y el benévolo (o de cortesía).

* **Fundamento:** YoViajo facilita el transporte benévolo, donde el aporte del pasajero no constituye un pago de pasaje (precio), sino un **reintegro de gastos compartidos** (combustible y peajes).
* **Impacto Legal:** Al no existir una relación de consumo onerosa comercial, la responsabilidad de la plataforma se limita a la intermediación técnica, y la del conductor se rige por las normas generales de responsabilidad civil, no por las leyes de transporte público automotor.

### 1.2. Protección de Datos Personales (Ley 25.326)

La recolección de DNI, nombres y datos de contacto se realiza bajo criterios de **Finalidad y Seguridad**.

* **Cumplimiento:** Los datos se utilizan exclusivamente para garantizar la trazabilidad de los viajes y la seguridad de la comunidad. La plataforma se compromete a la confidencialidad y protección de los activos digitales del usuario.

---

## 2. Análisis de Facetas de Acción Humana y Control Técnico

La robustez de YoViajo reside en la trazabilidad técnica de todas las acciones humanas que ocurren en su ecosistema:

### 2.1. Registro de Identidad (Gatekeeper Data)

A diferencia de servicios anónimos, la plataforma exige datos reales para el registro.

* **Trazabilidad:** Cada acción está vinculada a un perfil unívoco. En caso de requerimiento judicial, la plataforma puede proveer la cadena de identidad completa de los participantes en un evento.

### 2.2. Publicación y "Patrón Nafta" (Garantía de No-Lucro)

El sistema valida que los montos de cooperación guarden relación con el costo real del trayecto.

* **Control:** Esto desincentiva el uso de la app por parte de transportistas ilegales que buscan lucrar con una tarifa comercial, manteniendo el espíritu de ahorro colaborativo.

### 2.3. Contrato P2P y Autonomía de la Voluntad

La app actúa como facilitadora de un **Contrato entre Particulares**.

* **Handshake:** El proceso de reserva y aceptación mutua constituye un acuerdo de voluntades privado donde la app actúa como tercero de confianza y repositorio del pacto.

---

## 3. Protocolos de Seguridad Operativa y Respuesta a Incidentes

La "Robustez" de la plataforma no es solo teórica, sino operativa, basada en módulos de control activo:

### 3.1. Módulo de Reportes e Incidencias (`/api/reports`)

El sistema cuenta con un circuito de reporte mutuo (Conductor-Pasajero) que permite:

* **Moderación Activa:** El Admin tiene la capacidad de suspender cuentas basadas en patrones de reincidencia o reportes de seguridad.
* **Derecho de Admisión:** La plataforma se reserva el derecho de expulsar usuarios que comprometan los estándares de convivencia o seguridad de la comunidad.

### 3.2. Auditoría Forense (`AuditService`)

Cada acción crítica (login, publicación, cancelación, match) genera un **AuditLog** inmutable que incluye:

* **IP de conexión.**
* **Marca de tiempo de alta precisión.**
* **Detalle de la transacción.**
* **Argumento:** Esta bitácora técnica es una herramienta fundamental ante cualquier litigio, permitiendo reconstruir la secuencia de hechos con rigor técnico.

### 3.3. Seguridad Progresiva (MVP Pragmatism)

Reconocemos que las integraciones masivas (RENAPER, DNRPA) tienen un costo inviable para la etapa inicial. Nuestra robustez actual se basa en:

* **Sistema de Reputación:** Un historial de viajes exitosos es la prueba social más fuerte de identidad confiable.
* **Gatekeeper Protocol:** El acceso a la información de contacto solo se desbloquea tras un compromiso firme de viaje (Matching confirmado), protegiendo la privacidad de ambas partes.

---

## 4. Hoja de Ruta de Escalabilidad Legal

1. **Fase 1 (Actual):** Cumplimiento preventivo, trazabilidad y encuadre en transporte benévolo.
2. **Fase 2 (Escala):** Implementación de seguros de responsabilidad civil para carpooling y validaciones biométricas.
3. **Fase 3 (Expansión):** Encuadre fiscal automatizado y cumplimiento normativo regional (Mercosur).

---

> [!IMPORTANT]
> **Declaración de Principios:** YoViajo no opera en el vacío legal; opera en la vanguardia de las nuevas relaciones digitales de **Ayuda Mutua**. Al priorizar la trazabilidad y el no-lucro, el proyecto se posiciona como una solución de movilidad solidaria legítima y defendible ante cualquier organismo regulador.
