# LiveOrder OS 🚀

Plataforma SaaS orientada al *Social Commerce* (TikTok Live) que automatiza y audita en tiempo real la captura y adjudicación determinista de pedidos mediante una extensión de navegador, eliminando sobreventas y disputas de prelación en el chat.

## 📌 Arquitectura del Sistema

- **Frontend (Panel SaaS):** React + Vite + Tailwind CSS + Zustand
- **Extensión Chrome:** Manifest V3 (Content Script + Background Worker)
- **Backend:** Node.js + Express + Zod
- **Base de Datos & Concurrencia:** Supabase (PostgreSQL) con Stored Procedures (`SELECT ... FOR UPDATE`)
- **Automatización:** n8n + Evolution API (WhatsApp) + MercadoPago Sandbox

---

## 📂 Estructura del Proyecto

```text
├── database/            # Scripts SQL, migraciones y RPCs para Supabase
├── backend/             # API REST en Express + Zod
├── frontend/            # Panel SaaS en React + Vite
├── extension/           # Extensión de Chrome (Manifest V3)
└── docs/                # Especificaciones y contexto de negocio
```

---

## 🛠️ Fases de Desarrollo

- [x] Inicialización del repositorio y arquitectura
- [ ] **Fase 1:** Base de Datos y Lógica SQL (Supabase)
- [ ] **Fase 2:** Backend Base (Node.js + Express)
- [ ] **Fase 3:** Endpoints y Controladores del Backend
- [ ] **Fase 4:** Frontend Base (React + Vite + Tailwind)
- [ ] **Fase 5:** Extensión de Chrome (Manifest V3)
- [ ] **Fase 6:** Automatización (n8n + WhatsApp)
