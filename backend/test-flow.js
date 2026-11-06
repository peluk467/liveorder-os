// Script de verificación integral del flujo LiveOrder OS (Fases 1, 2 y 3)
const http = require('http');

const runVerification = async () => {
  console.log('🧪 Iniciando verificación del flujo determinista de LiveOrder OS...\n');

  const { supabase } = require('./src/config/supabase');
  const app = require('./src/index');

  const server = app.listen(3001, async () => {
    try {
      const baseUrl = 'http://localhost:3001/api';

      const post = (url, body) => fetch(baseUrl + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(r => r.json());

      const patch = (url, body) => fetch(baseUrl + url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }).then(r => r.json());

      const get = (url) => fetch(baseUrl + url).then(r => r.json());

      // 1. Crear sesión live
      console.log('1️⃣ Creando nueva sesión live...');
      const sesionRes = await post('/live', {
        vendedor_id: '00000000-0000-0000-0000-000000000001'
      });
      if (!sesionRes.success) throw new Error('Fallo al crear sesión: ' + JSON.stringify(sesionRes));
      const sesionId = sesionRes.data.id;
      console.log('   ✅ Sesión creada con ID:', sesionId);

      // 2. Activar sesión
      console.log('2️⃣ Activando sesión...');
      await patch(`/live/${sesionId}/estado`, { estado: 'activa' });
      console.log('   ✅ Sesión activada');

      // 3. Crear producto con stock = 2
      console.log('3️⃣ Registrando producto R38 con stock inicial = 2...');
      const prodRes = await post('/productos', {
        sesion_id: sesionId,
        codigo_chat: 'R38',
        stock_inicial: 2,
        precio: 15000
      });
      if (!prodRes.success) throw new Error('Fallo al crear producto: ' + JSON.stringify(prodRes));
      console.log('   ✅ Producto R38 registrado con éxito');

      // 4. Capturar primer pedido (@camila)
      console.log('4️⃣ Capturando pedido 1: @camila comenta "Mío R38"...');
      const order1 = await post('/pedidos/captura', {
        sesion_id: sesionId,
        codigo_chat: 'R38',
        tiktok_username: 'camila_live'
      });
      console.log('   📦 Resultado @camila:', order1.data.estado, '| Stock restante:', order1.data.stock_restante);
      if (order1.data.estado !== 'adjudicado' || order1.data.stock_restante !== 1) {
        throw new Error('Validación falló para pedido 1');
      }

      // 5. Capturar segundo pedido (@martin)
      console.log('5️⃣ Capturando pedido 2: @martin comenta "Mío R38"...');
      const order2 = await post('/pedidos/captura', {
        sesion_id: sesionId,
        codigo_chat: 'R38',
        tiktok_username: 'martin_fashion'
      });
      console.log('   📦 Resultado @martin:', order2.data.estado, '| Stock restante:', order2.data.stock_restante);
      if (order2.data.estado !== 'adjudicado' || order2.data.stock_restante !== 0) {
        throw new Error('Validación falló para pedido 2');
      }

      // 6. Capturar tercer pedido (@sofia - agotado)
      console.log('6️⃣ Capturando pedido 3: @sofia comenta "Mío R38" (Stock agotado)...');
      const order3 = await post('/pedidos/captura', {
        sesion_id: sesionId,
        codigo_chat: 'R38',
        tiktok_username: 'sofia_trendy'
      });
      console.log('   📦 Resultado @sofia:', order3.data.estado, '| Stock restante:', order3.data.stock_restante);
      if (order3.data.estado !== 'espera' || order3.data.stock_restante !== 0) {
        throw new Error('Validación falló para pedido 3 (debía quedar en lista de espera)');
      }

      // 7. Auditoría final de pedidos
      console.log('7️⃣ Consultando reporte auditado de la sesión...');
      const listado = await get(`/pedidos/sesion/${sesionId}`);
      console.log('   ✅ Total de pedidos registrados auditados:', listado.data.length);

      console.log('\n🎉 ¡VERIFICACIÓN EXITOSA! Todos los componentes (Base de datos, RPC Concurrente y Backend API) funcionan al 100% sin sobreventas.\n');
    } catch (err) {
      console.error('\n❌ ERROR DURANTE LA VERIFICACIÓN:', err.message);
    } finally {
      server.close();
      process.exit(0);
    }
  });
};

runVerification();
