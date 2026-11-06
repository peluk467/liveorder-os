import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../services/api';

export const useLiveStore = create(
  persist(
    (set, get) => ({
      // Estado base
      vendedorId: '00000000-0000-0000-0000-000000000001',
      sesionActual: null,
      productos: [],
      pedidos: [],
      historialAuditoria: [],
      mensajesSimulador: [
        { id: 1, usuario: 'tiktok_fan_99', texto: 'Hola qué tal!' },
        { id: 2, usuario: 'mari_moda', texto: 'Qué talles tienen?' }
      ],
      cargando: false,
      error: null,

      // Setters
      setVendedorId: (id) => set({ vendedorId: id }),
      setSesionActual: (sesion) => set({ sesionActual: sesion }),
      setError: (msg) => set({ error: msg }),

      // Cargar sesión activa de forma segura
      cargarSesionActiva: async () => {
        const { vendedorId, sesionActual } = get();
        try {
          const res = await api.obtenerSesionActiva(vendedorId);
          if (res.success && res.data) {
            set({ sesionActual: res.data, error: null });
            await get().cargarCatalogo(res.data.id);
            await get().cargarPedidos(res.data.id);
          } else if (res.success && !res.data) {
            // No hay ninguna sesión activa en base de datos
            // Solo resetear si la sesión guardada no estaba activa
            if (sesionActual?.estado === 'activa') {
              // Si la que teníamos ya no está activa en BD:
              set({ sesionActual: null });
            }
          }
        } catch (err) {
          console.error('Error al sincronizar sesión activa:', err);
          // Mantiene el estado en caché para no perder la vista
        }
      },

      // Iniciar nueva sesión
      iniciarSesion: async () => {
        const { vendedorId } = get();
        set({ cargando: true, error: null });
        try {
          const res = await api.crearSesion(vendedorId);
          if (res.success) {
            const resActiva = await api.actualizarEstadoSesion(res.data.id, 'activa');
            set({ sesionActual: resActiva.data, productos: [], pedidos: [] });

            // Intentar traer productos previos automáticamente si existían
            try {
              await get().importarCatalogoAnterior();
            } catch (_) {}

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

      // Cargar catálogo de la sesión actual
      cargarCatalogo: async (sesionId) => {
        try {
          const res = await api.listarProductos(sesionId);
          if (res.success && Array.isArray(res.data)) {
            set({ productos: res.data });
          }
        } catch (err) {
          console.error('Error al cargar catálogo:', err);
        }
      },

      // Importar / reutilizar productos del Live anterior
      importarCatalogoAnterior: async () => {
        const { sesionActual, vendedorId } = get();
        if (!sesionActual) return { success: false, error: 'No hay sesión activa' };

        try {
          const res = await api.clonarUltimoCatalogo(sesionActual.id, vendedorId);
          if (res.success && res.data) {
            await get().cargarCatalogo(sesionActual.id);
            return { success: true, count: res.data.length };
          }
          return { success: false, error: res.error || 'No se encontraron productos previos' };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      // Agregar producto al catálogo (se puede cargar antes o durante el live)
      agregarProducto: async ({ codigo_chat, stock_inicial, precio }) => {
        let { sesionActual } = get();
        if (!sesionActual) {
          await get().iniciarSesion();
          sesionActual = get().sesionActual;
        }
        if (!sesionActual) return { success: false, error: 'No se pudo inicializar la sesión para el stock' };

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

      // Editar producto
      editarProducto: async (id, datos) => {
        try {
          const res = await api.actualizarProducto(id, datos);
          if (res.success && res.data) {
            set((state) => ({
              productos: state.productos.map((p) => (p.id === id ? res.data : p))
            }));
            return { success: true };
          }
          return { success: false, error: res.error };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      // Eliminar producto
      eliminarProducto: async (id) => {
        try {
          const res = await api.eliminarProducto(id);
          if (res.success) {
            set((state) => ({
              productos: state.productos.filter((p) => p.id !== id)
            }));
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
          if (res.success && Array.isArray(res.data)) {
            set({ pedidos: res.data });
          }
        } catch (err) {
          console.error('Error al cargar pedidos:', err);
        }
      },

      // Capturar pedido
      capturarPedido: async ({ codigo_chat, tiktok_username, telefono }) => {
        const { sesionActual } = get();
        if (!sesionActual) return { success: false, error: 'No hay sesión activa' };
        try {
          const res = await api.capturarPedido({
            sesion_id: sesionActual.id,
            codigo_chat,
            tiktok_username,
            telefono: telefono || null
          });
          if (res.success) {
            await get().cargarCatalogo(sesionActual.id);
            await get().cargarPedidos(sesionActual.id);
            return { success: true, data: res.data };
          }
          return { success: false, error: res.error };
        } catch (err) {
          return { success: false, error: err.message };
        }
      },

      // Cargar historial completo para el Panel de Auditoría
      cargarHistorialAuditoria: async () => {
        const { vendedorId } = get();
        try {
          const res = await api.obtenerHistorialAuditoria(vendedorId);
          if (res.success) {
            set({ historialAuditoria: res.data });
          }
        } catch (err) {
          console.error('Error al cargar historial de auditoría:', err);
        }
      },

      // Reiniciar panel post-live (limpia la sesión activa y prepara para nuevo live, preservando el stock)
      reiniciarPanel: async () => {
        const { sesionActual } = get();
        if (sesionActual?.id && sesionActual.estado === 'activa') {
          try {
            await api.actualizarEstadoSesion(sesionActual.id, 'finalizada');
          } catch (_) {}
        }
        set({
          sesionActual: null,
          pedidos: [],
          mensajesSimulador: []
        });
      },

      // Mensajes del simulador persistentes
      agregarMensajeSimulador: (msg) => {
        set((state) => ({
          mensajesSimulador: [...state.mensajesSimulador, msg]
        }));
      },

      limpiarMensajesSimulador: () => {
        set({ mensajesSimulador: [] });
      }
    }),
    {
      name: 'liveorder_storage',
      partialize: (state) => ({
        vendedorId: state.vendedorId,
        sesionActual: state.sesionActual,
        productos: state.productos,
        mensajesSimulador: state.mensajesSimulador
      })
    }
  )
);
