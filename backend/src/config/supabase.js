const { createClient } = require('@supabase/supabase-js');
const { z } = require('zod');
require('dotenv').config();

// Validación de variables de entorno críticas con Zod
const envSchema = z.object({
  SUPABASE_URL: z.string().url('SUPABASE_URL debe ser una URL válida'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY es requerida')
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Error de configuración en variables de entorno:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

const supabase = createClient(
  parsedEnv.data.SUPABASE_URL,
  parsedEnv.data.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
);

module.exports = { supabase };
