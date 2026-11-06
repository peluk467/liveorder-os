const { supabase } = require('../config/supabase');
const { capturaPedidoSchema } = require('../schemas/pedidoSchema');

/**
 * Capturar intención de compra en vivo e invocar el RPC Determinista
 */
const capturarPedido = async (req, res, next) => {
  try {
    const validatedData = capturaPedidoSchema.parse(req.body);

    // Llamada al Stored Procedure en Supabase (FIFO con SELECT ... FOR UPDATE)
    const { data, error } = await supabase.rpc('adjudicar_pedido_concurrente', {
      p_sesion_id: validatedData.sesion_id,
      p_codigo_chat: validatedData.codigo_chat,
      p_tiktok_username: validatedData.tiktok_username,
      p_timestamp_llegada: validatedData.timestamp_llegada || new Date().toISOString()
    });

    if (error) {
      // Producto no encontrado para la sesión (Error P0002 lanzado en SQL)
      if (error.code === 'P0002') {
        return res.status(404).json({
          success: false,
          error: error.message
        });
      }
      throw error;
    }

    const resultado = data && data.length > 0 ? data[0] : null;

    if (!resultado) {
      return res.status(500).json({
        success: false,
        error: 'No se obtuvo respuesta del procedimiento de adjudicación'
      });
    }

    return res.status(200).json({
      success: true,
      data: resultado
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Listar pedidos de una sesión (para panel en vivo y post-live)
 */
const listarPedidosPorSesion = async (req, res, next) => {
  try {
    const { sesionId } = req.params;

    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        tiktok_username,
        timestamp_llegada,
        estado,
        created_at,
        productos!inner (
          id,
          codigo_chat,
          precio,
          sesion_id
        )
      `)
      .eq('productos.sesion_id', sesionId)
      .order('timestamp_llegada', { ascending: true });

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  capturarPedido,
  listarPedidosPorSesion
};
