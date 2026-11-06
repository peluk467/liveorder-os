import { create } from 'zustand';
import { api } from '../services/api';

export const useLiveStore = create((set, get) => ({
  // Estado base
  vendedorId: '00000000-0000-0000-0000-000000000001', // ID demo inicial o configurable
  sesionActual: null,
  productos: [],
  pedidos: [],
  cargando: false,
  error: null,

  // Setters
  setVendedorId: (id) => set({ vendedorId: id }),
  setSesionActual: (sesion) => set({ sesionActual: sesion }),
  setError: (msg) => set({ error: msg }),

  // Cargar sesión activa
  cargarSesionActiva: async () => {
    const { vendedorId } = get();
    set({ cargando: true, error: null });
    try {
      const res = await api.obtenerSesionActiva(vendedorId);
      if (res.success && res.data) {
        set({ sesionActual: res.data });
        await get().cargarCatalogo(res.data.id);
        await get().cargarPedidos(res.data.id);
      } else {
        set({ sesionActual: null, productos: [], pedidos: [] });
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ cargando: false });
    }
  },

  // Iniciar nueva sesión
  iniciarSesion: async () => {
    const { vendedorId } = get();
    set({ cargando: true, error: null });
    try {
      const res = await api.crearSesion(vendedorId);
      if (res.success) {
        // Activamos la sesión
        const resActiva = await api.actualizarEstadoSesion(res.data.id, 'activa');
        set({ sesionActual: resActiva.data, productos: [], pedidos: [] });
        return resActiva.data;
      }
    } catch (err) {
      set({ error: err.message });
    } finally {
      set({ cargando: false });
    }
  },

  // Finalizar sesión actual
  finalizarSesion: async () => {
    const { sesionActual } = get();
    if (!sesionActual) return;
    try {
      await api.actualizarEstadoSesion(sesionActual.id, 'finalizada');
      set((state) => ({
        sesionActual: { ...state.sesionActual, estado: 'finalizada' }
      }));
    } catch (err) {
      set({ error: err.message });
    }
  },

  // Cargar productos de la sesión
  cargarCatalogo: async (sesionId) => {
    try {
      const res = await api.listarProductos(sesionId);
      if (res.success) {
        set({ productos: res.data });
      }
    } catch (err) {
      console.error('Error al cargar catálogo:', err);
    }
  },

  // Agregar producto al catálogo
  agregarProducto: async ({ codigo_chat, stock_inicial, precio }) => {
    const { sesionActual } = get();
    if (!sesionActual) return;
    try {
      const res = await api.crearProducto({
        sesion_id: sesionActual.id,
        codigo_chat,
        stock_inicial: Number(stock_inicial),
        precio: Number(precio)
      });
      if (res.success) {
        set((state) => ({ productos: [...state.productos, res.data] }));
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Cargar pedidos de la sesión
  cargarPedidos: async (sesionId) => {
    try {
      const res = await api.listarPedidos(sesionId);
      if (res.success) {
        set({ pedidos: res.data });
      }
    } catch (err) {
      console.error('Error al cargar pedidos:', err);
    }
  },

  // Capturar pedido manual o simulado
  capturarPedido: async ({ codigo_chat, tiktok_username }) => {
    const { sesionActual } = get();
    if (!sesionActual) return;
    try {
      const res = await api.capturarPedido({
        sesion_id: sesionActual.id,
        codigo_chat,
        tiktok_username
      });
      if (res.success) {
        // Recargar inventario y pedidos para reflejar el stock exacto en milisegundos
        await get().cargarCatalogo(sesionActual.id);
        await get().cargarPedidos(sesionActual.id);
        return { success: true, data: res.data };
      }
      return { success: false, error: res.error };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
}));
