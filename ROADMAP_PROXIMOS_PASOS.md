# 🗺️ Roadmap - Próximos Pasos - YoViajo

## 📍 Estado Actual: 85% Consolidado

---

## 🎯 Opciones de Continuación (Priorizadas)

### **OPCIÓN A: Completar MVP Funcional** ⭐ (Recomendada)

**Objetivo:** Tener una app completamente funcional para usuarios finales

#### Prioridad 1: Sistema de Reservas (Booking)

- [ ] Crear modelo `Booking` en FastAPI
- [ ] Endpoints: `GET/POST /api/bookings/`
- [ ] Validaciones (asientos disponibles, no duplicados)
- [ ] UI: Botón "Reservar" funcional en tarjetas
- [ ] Vista "Mis Reservas"

**Tiempo estimado:** 4-5 horas  
**Valor:** ⭐⭐⭐⭐⭐ (Funcionalidad core)

#### Prioridad 2: Selector de Ciudades

- [ ] Lista de ciudades predefinidas (Argentina)
- [ ] Autocomplete en formularios
- [ ] Validación backend
- [ ] Mejor UX que inputs libres

**Tiempo estimado:** 2-3 horas  
**Valor:** ⭐⭐⭐⭐ (Mejora UX significativa)

#### Prioridad 3: UI "Mis Viajes"

- [ ] Filtros/Tabs: "Mis Ofertas" / "Mis Solicitudes" / "Mis Reservas"
- [ ] Endpoint `/api/rides/me` (ya existe, falta UI)
- [ ] Acciones: Editar, Cancelar viajes
- [ ] Estadísticas básicas

**Tiempo estimado:** 3-4 horas  
**Valor:** ⭐⭐⭐⭐ (Gestión personal)

---

### **OPCIÓN B: Features Avanzadas**

**Objetivo:** Agregar funcionalidades premium

#### Perfil de Conductor

- [ ] Modal para datos del auto (marca, modelo, color, patente)
- [ ] Foto de perfil
- [ ] Requisito para publicar viajes
- [ ] Validación de datos

**Tiempo estimado:** 4-5 horas

#### Sistema de Pagos

- [ ] Integración MercadoPago (Argentina)
- [ ] Flujo: "Pagar Reserva" → Señar viaje
- [ ] Estados: Pendiente → Pagado → Confirmado
- [ ] Webhooks para confirmación

**Tiempo estimado:** 8-10 horas

#### Chat entre Usuarios

- [ ] WebSockets o polling
- [ ] Modal de chat en tarjetas
- [ ] Historial de mensajes
- [ ] Notificaciones básicas

**Tiempo estimado:** 6-8 horas

---

### **OPCIÓN C: PWA Completo**

**Objetivo:** Convertir en Progressive Web App completa

#### Service Worker

- [ ] Cache de assets estáticos
- [ ] Offline básico (ver viajes recientes)
- [ ] Instalable en dispositivos

**Tiempo estimado:** 4-5 horas

#### Notificaciones Push

- [ ] Firebase Cloud Messaging
- [ ] Notificaciones de reservas
- [ ] Alertas de viajes

**Tiempo estimado:** 5-6 horas

---

### **OPCIÓN D: Mejoras de UX/UI**

**Objetivo:** Pulir la experiencia de usuario

#### Mejoras Visuales

- [ ] Animaciones más fluidas
- [ ] Loading states
- [ ] Mensajes de error amigables
- [ ] Toasts en lugar de alerts

**Tiempo estimado:** 4-5 horas

#### Búsqueda y Filtros

- [ ] Buscar por origen/destino
- [ ] Filtrar por precio, fecha
- [ ] Ordenar resultados

**Tiempo estimado:** 3-4 horas

---

### **OPCIÓN E: Mantenimiento y Calidad (Técnico)**

**Objetivo:** Asegurar la robustez y mantenibilidad del código a medida que crece la complejidad.

#### Testing Automatizado (Frontend)

- [ ] Configurar Vitest o Cypress
- [ ] Implementar pruebas E2E para flujos críticos (Registro, Login, Reserva)
- [ ] Configurar CI/CD para frontend
- **Condición:** Implementar cuando la complejidad del sistema aumente o antes de un refactor mayor.

**Tiempo estimado:** 6-8 horas
**Valor:** ⭐⭐⭐⭐⭐ (Seguridad y prevencion de regresiones)

#### Estandarización y Tipado (Calidad de Código)

- [ ] Backend: Configurar `ruff` para linting y format (Python).
- [ ] Frontend: Configurar `Prettier` + `ESLint` reglas estrictas.
- [ ] **Migración a TypeScript:** Planificar para Versión 2.0 (Requiere refactor masivo).
- **Condición:** Post-Despliegue inicial, en sprints de mantenimiento.

**Tiempo estimado:** 6-8 horas (Linting) / 2-3 semanas (TS Migration)
**Valor:** ⭐⭐⭐⭐⭐ (Mantenibilidad a largo plazo)

#### Observabilidad (Point 4)

- [ ] Integrar Sentry (Backend + Frontend) para reporte de errores en tiempo real.
- **Condición:** Post-Despliegue inmediato.

#### Seguridad Avanzada (Point 5)

- [ ] Implementar Rate Limiting (FastAPI-Limiter + Redis).
- [ ] Revisión estricta de RBAC (Role Based Access Control) en todas las rutas.
- **Condición:** Antes de escalar usuarios masivamente.

---

## 🎯 Recomendación: OPCIÓN A (MVP Funcional)

**Razón:** Tienes una base sólida. Completar el MVP te dará:

- ✅ App funcional para usuarios reales
- ✅ Ciclo completo: Publicar → Reservar → Gestionar
- ✅ Base para agregar features premium después

### Secuencia Sugerida

**Sprint 1 (1-2 días):**

1. ✅ Sistema de Reservas (Booking)
2. ✅ UI "Mis Viajes" básica

**Sprint 2 (1 día):**
3. ✅ Selector de ciudades

**Resultado:** MVP 100% funcional 🎉

---

## 🚀 ¿Cómo Procedemos?

### **Opción 1: Implementar Booking (Recomendado)**

Te guío paso a paso para implementar el sistema de reservas completo.

### **Opción 2: Selector de Ciudades**

Implementamos autocomplete con ciudades de Argentina.

### **Opción 3: UI "Mis Viajes"**

Crear la interfaz para gestionar viajes propios.

### **Opción 4: Personalizado**

Me dices qué feature específica quieres priorizar.

---

## 💡 Mi Sugerencia

**Empecemos con BOOKING** porque:

- Completa el flujo core de la app
- Es la funcionalidad más solicitada por usuarios
- Es relativamente rápido de implementar (4-5 horas)
- Abre la puerta a pagos después

¿Qué opción prefieres? 🚀
