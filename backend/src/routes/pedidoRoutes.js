const express = require('express');
const router = express.Router();
const {
  capturarPedido,
  listarPedidosPorSesion
} = require('../controllers/pedidoController');

// POST /api/pedidos/captura - Captura y adjudicación determinista en tiempo real
router.post('/captura', capturarPedido);

// GET /api/pedidos/sesion/:sesionId - Listado auditado de pedidos para el live
router.get('/sesion/:sesionId', listarPedidosPorSesion);

module.exports = router;
