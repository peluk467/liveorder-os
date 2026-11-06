const { z } = require('zod');

const crearSesionSchema = z.object({
  vendedor_id: z.string().uuid({ message: 'vendedor_id debe ser un UUID válido' })
});

const actualizarEstadoSesionSchema = z.object({
  estado: z.enum(['creada', 'activa', 'finalizada'], {
    errorMap: () => ({ message: 'El estado debe ser: creada, activa o finalizada' })
  })
});

module.exports = {
  crearSesionSchema,
  actualizarEstadoSesionSchema
};
