const express = require('express');
const router = express.Router();
const {
  crearProducto,
  listarProductosPorSesion,
  actualizarProducto,
  clonarUltimoCatalogo
} = require('../controllers/productoController');

// POST /api/productos - Cargar producto a una sesión
router.post('/', crearProducto);

// POST /api/productos/clonar-anterior - Reutilizar catálogo de sesión anterior
router.post('/clonar-anterior', clonarUltimoCatalogo);

// GET /api/productos/sesion/:sesionId - Listar catálogo de la sesión
router.get('/sesion/:sesionId', listarProductosPorSesion);

// PATCH /api/productos/:id - Modificar stock disponible o precio
router.patch('/:id', actualizarProducto);

module.exports = router;
