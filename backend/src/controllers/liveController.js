const { supabase } = require('../config/supabase');
const { crearSesionSchema, actualizarEstadoSesionSchema } = require('../schemas/liveSchema');

/**
 * Iniciar o registrar una nueva sesión Live
 */
const crearSesion = async (req, res, next) => {
  try {
    const validatedData = crearSesionSchema.parse(req.body);

    // Finalizar cualquier sesión activa previa del vendedor para evitar duplicados
    await supabase
      .from('sesiones_live')
      .update({ estado: 'finalizada' })
      .eq('vendedor_id', validatedData.vendedor_id)
      .eq('estado', 'activa');

    const { data, error } = await supabase
      .from('sesiones_live')
      .insert([
        {
          vendedor_id: validatedData.vendedor_id,
          estado: 'creada'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Obtener la sesión activa actual de un vendedor
 */
const obtenerSesionActiva = async (req, res, next) => {
  try {
    const { vendedorId } = req.params;

    const { data, error } = await supabase
      .from('sesiones_live')
      .select('*')
      .eq('vendedor_id', vendedorId)
      .eq('estado', 'activa')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data && data.length > 0 ? data[0] : null
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Actualizar el estado de la sesión (ej: activar o finalizar live)
 */
const actualizarEstadoSesion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = actualizarEstadoSesionSchema.parse(req.body);

    if (validatedData.estado === 'activa') {
      const { data: currentSession } = await supabase
        .from('sesiones_live')
        .select('vendedor_id')
        .eq('id', id)
        .single();

      if (currentSession?.vendedor_id) {
        await supabase
          .from('sesiones_live')
          .update({ estado: 'finalizada' })
          .eq('vendedor_id', currentSession.vendedor_id)
          .eq('estado', 'activa')
          .neq('id', id);
      }
    }

    const { data, error } = await supabase
      .from('sesiones_live')
      .update({ estado: validatedData.estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Disparar Webhook a n8n para el cobro masivo por WhatsApp + MercadoPago
 */
const dispararWebhookCierre = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 1. Obtener pedidos adjudicados de la sesión
    const { data: pedidos, error } = await supabase
      .from('pedidos')
      .select(`
        tiktok_username,
        productos!inner (
          codigo_chat,
          precio,
          sesion_id
        )
      `)
      .eq('productos.sesion_id', id)
      .eq('estado', 'adjudicado');

    if (error) throw error;

    if (!pedidos || pedidos.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No hay pedidos adjudicados para enviar en esta sesión',
        compradores_notificados: 0
      });
    }

    // 2. Agrupar por comprador
    const agrupados = pedidos.reduce((acc, p) => {
      const user = p.tiktok_username;
      if (!acc[user]) {
        acc[user] = {
          username: user,
          items: [],
          total: 0
        };
      }
      acc[user].items.push(p.productos.codigo_chat);
      acc[user].total += Number(p.productos.precio || 0);
      return acc;
    }, {});

    const compradores = Object.values(agrupados);
    const totalVentas = compradores.reduce((sum, c) => sum + c.total, 0);

    const payload = {
      sesion_id: id,
      timestamp_cierre: new Date().toISOString(),
      total_ventas: totalVentas,
      cantidad_compradores: compradores.length,
      compradores
    };

    // 3. Reenviar al Webhook de n8n (si está configurado)
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
    let n8nResponse = null;

    if (n8nWebhookUrl) {
      try {
        const respuesta = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        n8nResponse = await respuesta.json();
      } catch (webhookErr) {
        console.warn('⚠️ No se pudo conectar con la instancia de n8n:', webhookErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        payload_generado: payload,
        n8n_conectado: !!n8nWebhookUrl,
        n8n_resultado: n8nResponse || 'Modo simulación / n8n no configurado todavía'
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Listar todo el historial de lives para el Panel de Auditoría
 */
const listarHistorialAuditoria = async (req, res, next) => {
  try {
    const { vendedorId } = req.params;

    // 1. Obtener todas las sesiones del vendedor ordenadas por fecha reciente
    const { data: sesiones, error: errorSesiones } = await supabase
      .from('sesiones_live')
      .select('*')
      .eq('vendedor_id', vendedorId)
      .order('created_at', { ascending: false });

    if (errorSesiones) throw errorSesiones;

    if (!sesiones || sesiones.length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    const sesionIds = sesiones.map(s => s.id);

    // 2. Obtener productos de esas sesiones
    const { data: productos, error: errorProds } = await supabase
      .from('productos')
      .select('*')
      .in('sesion_id', sesionIds);

    if (errorProds) throw errorProds;

    // 3. Obtener todos los pedidos
    const prodIds = (productos || []).map(p => p.id);
    let pedidos = [];
    if (prodIds.length > 0) {
      const { data: pedidosData, error: errorPedidos } = await supabase
        .from('pedidos')
        .select(`
          id,
          producto_id,
          tiktok_username,
          telefono,
          timestamp_llegada,
          estado,
          created_at,
          productos (
            codigo_chat,
            precio,
            sesion_id
          )
        `)
        .in('producto_id', prodIds)
        .order('timestamp_llegada', { ascending: true });

      if (errorPedidos) throw errorPedidos;
      pedidos = pedidosData || [];
    }

    // 4. Mapear y consolidar la información por sesión
    const historial = sesiones.map(sesion => {
      const prodsSesion = (productos || []).filter(p => p.sesion_id === sesion.id);
      const pedidosSesion = pedidos.filter(p => p.productos?.sesion_id === sesion.id);
      const adjudicados = pedidosSesion.filter(p => p.estado === 'adjudicado');
      const enEspera = pedidosSesion.filter(p => p.estado === 'espera');

      // Agrupar compradores
      const compradoresMap = {};
      adjudicados.forEach(p => {
        const u = p.tiktok_username;
        if (!compradoresMap[u]) {
          compradoresMap[u] = {
            username: u,
            telefono: p.telefono || null,
            items: [],
            total: 0,
            primera_compra: p.timestamp_llegada
          };
        }
        compradoresMap[u].items.push(p.productos?.codigo_chat);
        compradoresMap[u].total += Number(p.productos?.precio || 0);
        // Si no tenía teléfono y este pedido sí, actualizarlo
        if (!compradoresMap[u].telefono && p.telefono) {
          compradoresMap[u].telefono = p.telefono;
        }
      });

      const listaCompradores = Object.values(compradoresMap);
      const totalRecaudado = listaCompradores.reduce((sum, c) => sum + c.total, 0);

      return {
        id: sesion.id,
        estado: sesion.estado,
        fecha_hora_inicio: sesion.created_at,
        total_ventas: totalRecaudado,
        prendas_adjudicadas: adjudicados.length,
        demanda_espera: enEspera.length,
        total_compradores: listaCompradores.length,
        productos: prodsSesion,
        pedidos: pedidosSesion,
        compradores: listaCompradores
      };
    });

    return res.status(200).json({
      success: true,
      data: historial
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  crearSesion,
  obtenerSesionActiva,
  actualizarEstadoSesion,
  dispararWebhookCierre,
  listarHistorialAuditoria
};
