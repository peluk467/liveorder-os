-- ==============================================================================
-- LiveOrder OS - Script DDL & Procedimientos Almacenados (Supabase / PostgreSQL)
-- ==============================================================================

-- 1. TIPOS ENUMERADOS
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_sesion_enum') THEN
        CREATE TYPE estado_sesion_enum AS ENUM ('creada', 'activa', 'finalizada');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_pedido_enum') THEN
        CREATE TYPE estado_pedido_enum AS ENUM ('adjudicado', 'espera', 'pagado', 'cancelado');
    END IF;
END $$;

-- 2. TABLA: usuarios_vendedores
CREATE TABLE IF NOT EXISTS usuarios_vendedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    nombre_comercio VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLA: sesiones_live
CREATE TABLE IF NOT EXISTS sesiones_live (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendedor_id UUID NOT NULL REFERENCES usuarios_vendedores(id) ON DELETE CASCADE,
    estado estado_sesion_enum NOT NULL DEFAULT 'creada',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA: productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sesion_id UUID NOT NULL REFERENCES sesiones_live(id) ON DELETE CASCADE,
    codigo_chat VARCHAR(50) NOT NULL,
    stock_inicial INT NOT NULL CHECK (stock_inicial >= 0),
    stock_disponible INT NOT NULL CHECK (stock_disponible >= 0),
    precio DECIMAL(10, 2) NOT NULL CHECK (precio >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_sesion_codigo UNIQUE (sesion_id, codigo_chat)
);

-- 5. TABLA: pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    tiktok_username VARCHAR(100) NOT NULL,
    telefono VARCHAR(50),
    timestamp_llegada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estado estado_pedido_enum NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ÍNDICES DE RENDIMIENTO Y PRELACIÓN
CREATE INDEX IF NOT EXISTS idx_sesiones_vendedor ON sesiones_live(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_productos_sesion ON productos(sesion_id);
CREATE INDEX IF NOT EXISTS idx_productos_codigo_upper ON productos(sesion_id, UPPER(codigo_chat));
CREATE INDEX IF NOT EXISTS idx_pedidos_producto_llegada ON pedidos(producto_id, timestamp_llegada ASC);
CREATE INDEX IF NOT EXISTS idx_pedidos_username ON pedidos(tiktok_username);

-- ==============================================================================
-- 7. RPC: adjudicar_pedido_concurrente
-- ==============================================================================

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
    SELECT id, productos.codigo_chat, stock_disponible
    INTO v_producto
    FROM productos
    WHERE productos.sesion_id = p_sesion_id
      AND UPPER(productos.codigo_chat) = UPPER(p_codigo_chat)
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Producto con código "%" no encontrado en la sesión %', p_codigo_chat, p_sesion_id
            USING ERRCODE = 'P0002';
    END IF;

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
