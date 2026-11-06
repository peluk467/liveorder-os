-- ==============================================================================
-- LiveOrder OS - Datos Semilla (Seed) para Pruebas
-- ==============================================================================

INSERT INTO usuarios_vendedores (id, email, nombre_comercio)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'vendedor@liveorder.test',
    'Tienda Demo TikTok'
)
ON CONFLICT (id) DO NOTHING;
