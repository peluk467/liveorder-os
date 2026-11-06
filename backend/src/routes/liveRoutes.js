const express = require('express');
const router = express.Router();
const {
  crearSesion,
  obtenerSesionActiva,
  actualizarEstadoSesion,
  dispararWebhookCierre
} = require('../controllers/liveController');

// POST /api/live - Iniciar nueva sesión
router.post('/', crearSesion);

// GET /api/live/activa/:vendedorId - Obtener sesión activa de un vendedor
router.get('/activa/:vendedorId', obtenerSesionActiva);

// PATCH /api/live/:id/estado - Cambiar estado (creada | activa | finalizada)
router.patch('/:id/estado', actualizarEstadoSesion);

// POST /api/live/:id/cierre-webhook - Disparar webhook de cobros a n8n
router.post('/:id/cierre-webhook', dispararWebhookCierre);

module.exports = router;
