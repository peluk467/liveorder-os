-- ==============================================================================
-- LiveOrder OS - Migración: Soporte de Teléfono/WhatsApp en Pedidos
-- Ejecutar en Supabase SQL Editor
-- ==============================================================================

-- 1. Añadir columna telefono a la tabla pedidos si no existe
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS telefono VARCHAR(50);

-- 2. Eliminar firma anterior de la función si es necesario
DROP FUNCTION IF EXISTS adjudicar_pedido_concurrente(UUID, VARCHAR, VARCHAR, TIMESTAMPTZ);
DROP FUNCTION IF EXISTS adjudicar_pedido_concurrente(UUID, VARCHAR, VARCHAR, TIMESTAMPTZ, VARCHAR);

-- 3. Crear función actualizada con parámetro p_telefono
CREATE OR REPLACE FUNCTION adjudicar_pedido_concurrente(
    p_sesion_id UUID,
    p_codigo_chat VARCHAR,
    p_tiktok_username VARCHAR,
    p_timestamp_llegada TIMESTAMPTZ DEFAULT NOW(),
    p_telefono VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    pedido_id UUID,
    producto_id UUID,
    codigo_chat VARCHAR,
    tiktok_username VARCHAR,
    telefono VARCHAR,
    estado estado_pedido_enum,
    stock_restante INT,
    mensaje TEXT
) 
LANGUAGE plpgsql
AS $$
DECLARE
    v_producto RECORD;
    v_estado_asignado estado_pedido_enum;
    v_stock_final INT;
    v_pedido_id UUID;
    v_mensaje TEXT;
BEGIN
    -- 1. Candado Row-Level Lock
    SELECT id, productos.codigo_chat, stock_disponible
    INTO v_producto
    FROM productos
    WHERE productos.sesion_id = p_sesion_id
      AND UPPER(productos.codigo_chat) = UPPER(p_codigo_chat)
    FOR UPDATE;

    -- 2. Validación de producto en la sesión
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto con código "%" no encontrado en la sesión %', p_codigo_chat, p_sesion_id
            USING ERRCODE = 'P0002';
    END IF;

    -- 3. Decisión Determinista (FIFO)
    IF v_producto.stock_disponible > 0 THEN
        UPDATE productos
        SET stock_disponible = stock_disponible - 1
        WHERE id = v_producto.id
        RETURNING stock_disponible INTO v_stock_final;

        v_estado_asignado := 'adjudicado';
        v_mensaje := 'Stock reservado exitosamente (Adjudicado)';
    ELSE
        v_stock_final := 0;
        v_estado_asignado := 'espera';
        v_mensaje := 'Sin stock disponible. Ingresado a lista de espera';
    END IF;

    -- 4. Registrar pedido con teléfono/WhatsApp
    INSERT INTO pedidos (
        producto_id,
        tiktok_username,
        timestamp_llegada,
        estado,
        telefono
    )
    VALUES (
        v_producto.id,
        p_tiktok_username,
        p_timestamp_llegada,
        v_estado_asignado,
        p_telefono
    )
    RETURNING id INTO v_pedido_id;

    -- 5. Retornar resultado estructurado
    RETURN QUERY SELECT 
        v_pedido_id,
        v_producto.id,
        v_producto.codigo_chat,
        p_tiktok_username,
        p_telefono,
        v_estado_asignado,
        v_stock_final,
        v_mensaje;
END;
$$;
