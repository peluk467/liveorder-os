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

module.exports = {
  crearSesion,
  obtenerSesionActiva,
  actualizarEstadoSesion
};
