const { supabase } = require('../config/supabase');
const { crearProductoSchema, actualizarProductoSchema } = require('../schemas/productoSchema');

/**
 * Cargar un producto para una sesión live específica
 */
const crearProducto = async (req, res, next) => {
  try {
    const validatedData = crearProductoSchema.parse(req.body);

    const { data, error } = await supabase
      .from('productos')
      .insert([
        {
          sesion_id: validatedData.sesion_id,
          codigo_chat: validatedData.codigo_chat,
          stock_inicial: validatedData.stock_inicial,
          stock_disponible: validatedData.stock_inicial, // Inicialmente disponible = inicial
          precio: validatedData.precio
        }
      ])
      .select()
      .single();

    if (error) {
      // Manejar código único duplicado en la misma sesión
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          error: `El código "${validatedData.codigo_chat}" ya está registrado en esta sesión`
        });
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Listar todos los productos cargados para una sesión
 */
const listarProductosPorSesion = async (req, res, next) => {
  try {
    const { sesionId } = req.params;

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('sesion_id', sesionId)
      .order('created_at', { ascending: true });

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
 * Actualizar stock o precio de un producto
 */
const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const validatedData = actualizarProductoSchema.parse(req.body);

    const { data, error } = await supabase
      .from('productos')
      .update(validatedData)
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
  crearProducto,
  listarProductosPorSesion,
  actualizarProducto
};
