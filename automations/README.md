# LiveOrder OS - Automatización Post-Live (Fase 6) ⚡

Este módulo automatiza el cierre de ventas de transmisiones en vivo:
1. **Consolidación de compras:** Agrupa todas las prendas adjudicadas por usuario único de TikTok.
2. **Generación de Cobro:** Crea la preferencia de pago en la API de **MercadoPago (Sandbox)**.
3. **Disparo de Mensajería:** Envía el mensaje con el detalle y el enlace de pago vía **Evolution API (WhatsApp/Baileys)** a cada comprador.

---

## 📂 Archivos en esta Carpeta

- **`n8n-workflow-liveorder.json`**: Flujo completo listo para importar en [n8n](https://n8n.io/).

---

## 🚀 Cómo Implementar el Flujo en n8n

### 1. Importar el Workflow en n8n
1. En tu instancia de n8n (local o en la nube), ve a **Workflows** > **Import from File**.
2. Selecciona el archivo `n8n-workflow-liveorder.json`.
3. Activa el switch **Active** arriba a la derecha.

### 2. Configurar Variables de Entorno en n8n
En las credenciales o variables de entorno de tu n8n configura:
* `MP_ACCESS_TOKEN`: Tu Access Token de prueba de MercadoPago Developers (`TEST-...`).
* `EVOLUTION_API_URL`: URL de tu instancia de Evolution API (ej: `http://localhost:8080`).
* `EVOLUTION_API_KEY`: API Key configurada en Evolution API.

### 3. Conectar el Backend con n8n
En tu archivo `liveorder-os/backend/.env`, agrega la URL de producción o test de tu Webhook:
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/liveorder-cierre
```

---

## 📲 Alternativa Nativa Directa (WhatsApp Web)
El panel **Post-Live** incluye botones individuales **"Cobrar WhatsApp"** que generan automáticamente el mensaje preformateado y abren la conversación en WhatsApp Web directamente sin necesidad de servicios externos.
