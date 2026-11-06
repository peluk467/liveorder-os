const express = require('express');
const router = express.Router();
const {
  crearSesion,
  obtenerSesionActiva,
  actualizarEstadoSesion,
  dispararWebhookCierre,
  listarHistorialAuditoria
} = require('../controllers/liveController');

// POST /api/live - Iniciar nueva sesión
router.post('/', crearSesion);

// GET /api/live/activa/:vendedorId - Obtener sesión activa de un vendedor
router.get('/activa/:vendedorId', obtenerSesionActiva);

// GET /api/live/historial/:vendedorId - Historial completo para panel de auditoría
router.get('/historial/:vendedorId', listarHistorialAuditoria);

// PATCH /api/live/:id/estado - Cambiar estado (creada | activa | finalizada)
router.patch('/:id/estado', actualizarEstadoSesion);

// POST /api/live/:id/cierre-webhook - Disparar webhook de cobros a n8n
router.post('/:id/cierre-webhook', dispararWebhookCierre);

module.exports = router;
