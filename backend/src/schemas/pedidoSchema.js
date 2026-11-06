const { z } = require('zod');

const capturaPedidoSchema = z.object({
  sesion_id: z.string().uuid({ message: 'sesion_id debe ser un UUID válido' }),
  codigo_chat: z
    .string()
    .min(1, { message: 'codigo_chat es requerido' })
    .transform((val) => val.trim().toUpperCase()),
  tiktok_username: z
    .string()
    .min(1, { message: 'tiktok_username es requerido' })
    .transform((val) => val.trim().replace(/^@/, '')), // Remueve arroba si viene del chat
  timestamp_llegada: z
    .string()
    .datetime({ message: 'timestamp_llegada debe ser una fecha ISO válida' })
    .optional()
});

module.exports = {
  capturaPedidoSchema
};
