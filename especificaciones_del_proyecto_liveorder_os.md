# LiveOrder OS - Especificaciones y Plan de Desarrollo

Este documento define la arquitectura, stack tecnológico y el plan de ejecución iterativo para el desarrollo de LiveOrder OS. 

**INSTRUCCIONES PARA LA IA (REGLAS DE OPERACIÓN):**
Si estás leyendo este documento como un asistente de IA, debes acatar estrictamente las siguientes reglas:
1. **Cero Alucinación / No Vibecoding:** Cíñete al stack y arquitectura aquí definidos. No inventes librerías ni flujos no especificados.
2. **Ahorro de Tokens y Trabajo Modular:** **NO** generes todo el código de una sola vez. Trabaja paso a paso siguiendo las "Fases de Desarrollo" detalladas abajo.
3. **Flujo de Interacción:** 
   - Cuando te pida iniciar una fase, dame SOLO la estructura de carpetas y los archivos clave de ese paso.
   - Espera a que yo implemente el código y te diga "VERIFICAR" o "SIGUIENTE".
   - Si te pido "VERIFICAR", analizaré el código que pegue y tú me dirás si hay errores, vulnerabilidades o mejoras de buenas prácticas.
4. **Buenas Prácticas (Git y Código):** Sugiere nombres de commits usando *Conventional Commits* (ej. `feat: añade control de concurrencia en BD`, `fix: corrige error de regex`). Escribe código limpio, modular y con tipado estricto/validaciones (Zod).

---

## 1. Arquitectura y Stack Tecnológico
- **Frontend (Panel SaaS):** React + Vite + Tailwind CSS + Zustand (Estado). Despliegue en Vercel.
- **Extensión Chrome:** Manifest V3 (Content Script + Background Worker).
- **Backend:** Node.js + Express + Zod (Validación). Despliegue en Render (Tier gratuito).
- **Base de Datos:** Supabase (PostgreSQL) usando `@supabase/supabase-js`.
- **Automatizaciones (Costo Cero):** n8n (Render) + Evolution API (Baileys/WhatsApp) + API MercadoPago (Sandbox).

---

## 2. Lógica Crítica: Automatización Determinista (Concurrencia)
El sistema debe resolver el problema de la sobreventa (Race Conditions). 
- **Regla:** La validación de stock NO se hace en Node.js, se delega a PostgreSQL.
- **Mecanismo:** Se utilizará un *Stored Procedure / RPC* en Supabase con `SELECT ... FOR UPDATE` (Row-Level Locks). El primer request en milisegundos resta stock y marca pedido como 'adjudicado'; los posteriores van a 'espera'.

---

## 3. Esquema de Base de Datos (Supabase)

- **`usuarios_vendedores`**: `id` (UUID, PK), `email` (Unique), `nombre_comercio`, `created_at`.
- **`sesiones_live`**: `id` (UUID, PK), `vendedor_id` (FK), `estado` (ENUM: creada, activa, finalizada), `created_at`.
- **`productos`**: `id` (UUID, PK), `sesion_id` (FK), `codigo_chat` (VARCHAR, ej: "R38" - Unique por sesion_id), `stock_inicial` (INT), `stock_disponible` (INT), `precio` (DECIMAL).
- **`pedidos`**: `id` (UUID, PK), `producto_id` (FK), `tiktok_username` (VARCHAR), `timestamp_llegada` (TIMESTAMPTZ), `estado` (ENUM: adjudicado, espera, pagado, cancelado).

---

## 4. Fases de Desarrollo (Ejecución Paso a Paso)

### Fase 1: Base de Datos y Lógica SQL (Supabase)
- **Objetivo:** Crear tablas, relaciones y la función RPC para el control de stock concurrente.
- **Acción del Usuario:** Pedir a la IA "Inicia la Fase 1".
- **Entregable IA:** Script SQL puro.

### Fase 2: Configuración del Backend (Node/Express)
- **Objetivo:** Estructura de carpetas, configuración de Express, middlewares (CORS, Error Handler) y conexión a Supabase.
- **Acción del Usuario:** Pedir a la IA "Inicia la Fase 2".
- **Entregable IA:** `package.json` inicial, estructura `/src` y archivo `index.js` base.

### Fase 3: Endpoints y Servicios del Backend
- **Objetivo:** Crear rutas REST (`/api/live`, `/api/productos`, `/api/pedidos/captura`) y los controladores que llaman al RPC de Supabase.
- **Acción del Usuario:** Pedir a la IA "Inicia la Fase 3".
- **Entregable IA:** Código de rutas y controladores específicos.

### Fase 4: Frontend Base (React + Vite)
- **Objetivo:** Setup del dashboard, enrutamiento básico (React Router) y configuración de Tailwind.
- **Acción del Usuario:** Pedir a la IA "Inicia la Fase 4".

### Fase 5: Extensión de Chrome (Content Script)
- **Objetivo:** Leer el DOM de TikTok con `MutationObserver`, extraer data con Regex y enviar POST al Backend.
- **Acción del Usuario:** Pedir a la IA "Inicia la Fase 5".

### Fase 6: Automatización (n8n + WhatsApp)
- **Objetivo:** Conectar el Webhook de cierre de sesión para disparar mensajes de pago vía Evolution API.
- **Acción del Usuario:** Pedir a la IA "Inicia la Fase 6".