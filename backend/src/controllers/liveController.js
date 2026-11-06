const { supabase } = require('../config/supabase');
const { crearSesionSchema, actualizarEstadoSesionSchema } = require('../schemas/liveSchema');

/**
 * Iniciar o registrar una nueva sesión Live
 */
const crearSesion = async (req, res, next) => {
  try {
    const validatedData = crearSesionSchema.parse(req.body);

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
      .maybeSingle();

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
 * Actualizar el estado de la sesión (ej: activar o finalizar live)
 */
const actualizarEstadoSesion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = actualizarEstadoSesionSchema.parse(req.body);

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
