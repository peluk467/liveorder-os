const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = {
  // Sesiones Live
  crearSesion: async (vendedor_id) => {
    const res = await fetch(`${API_BASE_URL}/live`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendedor_id })
    });
    return res.json();
  },

  obtenerSesionActiva: async (vendedorId) => {
    const res = await fetch(`${API_BASE_URL}/live/activa/${vendedorId}`);
    return res.json();
  },

  obtenerHistorialAuditoria: async (vendedorId) => {
    const res = await fetch(`${API_BASE_URL}/live/historial/${vendedorId}`);
    return res.json();
  },

  actualizarEstadoSesion: async (sesionId, estado) => {
    const res = await fetch(`${API_BASE_URL}/live/${sesionId}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado })
    });
    return res.json();
  },

  dispararCierreWebhook: async (sesionId) => {
    const res = await fetch(`${API_BASE_URL}/live/${sesionId}/cierre-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  // Productos / Inventario
  crearProducto: async ({ sesion_id, codigo_chat, stock_inicial, precio }) => {
    const res = await fetch(`${API_BASE_URL}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sesion_id, codigo_chat, stock_inicial, precio })
    });
    return res.json();
  },

  listarProductos: async (sesionId) => {
    const res = await fetch(`${API_BASE_URL}/productos/sesion/${sesionId}`);
    return res.json();
  },

  clonarUltimoCatalogo: async (sesionActualId, vendedorId) => {
    const res = await fetch(`${API_BASE_URL}/productos/clonar-anterior`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sesionActualId, vendedorId })
    });
    return res.json();
  },

  // Pedidos en Vivo
  capturarPedido: async ({ sesion_id, codigo_chat, tiktok_username, telefono }) => {
    const res = await fetch(`${API_BASE_URL}/pedidos/captura`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sesion_id, codigo_chat, tiktok_username, telefono })
    });
    return res.json();
  },

  listarPedidos: async (sesionId) => {
    const res = await fetch(`${API_BASE_URL}/pedidos/sesion/${sesionId}`);
    return res.json();
  }
};
