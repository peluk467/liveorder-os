const { z } = require('zod');

const crearProductoSchema = z.object({
  sesion_id: z.string().uuid({ message: 'sesion_id debe ser un UUID válido' }),
  codigo_chat: z
    .string()
    .min(1, { message: 'codigo_chat no puede estar vacío' })
    .max(50, { message: 'codigo_chat no puede exceder 50 caracteres' })
    .transform((val) => val.trim().toUpperCase()),
  stock_inicial: z
    .number({ invalid_type_error: 'stock_inicial debe ser un número entero' })
    .int()
    .nonnegative({ message: 'stock_inicial no puede ser negativo' }),
  precio: z
    .number({ invalid_type_error: 'precio debe ser numérico' })
    .nonnegative({ message: 'precio no puede ser negativo' })
});

const actualizarProductoSchema = z.object({
  codigo_chat: z
    .string()
    .min(1)
    .max(50)
    .transform((val) => val.trim().toUpperCase())
    .optional(),
  stock_inicial: z.number().int().nonnegative().optional(),
  stock_disponible: z.number().int().nonnegative().optional(),
  precio: z.number().nonnegative().optional()
});

module.exports = {
  crearProductoSchema,
  actualizarProductoSchema
};
