import React, { useState, useEffect } from 'react';
import { useLiveStore } from '../store/useLiveStore';
import { Radio, Users, CheckCircle, Clock, Zap, ArrowRight, RefreshCw } from 'lucide-react';

export const LiveMonitorPage = () => {
  const {
    sesionActual,
    productos,
    pedidos,
    cargarSesionActiva,
    cargarPedidos,
    cargarCatalogo,
    capturarPedido
  } = useLiveStore();

  const [simUser, setSimUser] = useState('');
  const [simCodigo, setSimCodigo] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simMensaje, setSimMensaje] = useState(null);

  useEffect(() => {
    cargarSesionActiva();
    const interval = setInterval(() => {
      if (sesionActual?.id) {
        cargarPedidos(sesionActual.id);
        cargarCatalogo(sesionActual.id);
      }
    }, 2500); // Polling ligero para monitor en vivo
    return () => clearInterval(interval);
  }, [sesionActual?.id]);

  const handleSimularCaptura = async (e) => {
    e.preventDefault();
    if (!simUser || !simCodigo) return;

    setSimLoading(true);
    setSimMensaje(null);
    const res = await capturarPedido({
      tiktok_username: simUser,
      codigo_chat: simCodigo
    });
    setSimLoading(false);

    if (res.success) {
      setSimMensaje({
        tipo: res.data.estado === 'adjudicado' ? 'success' : 'warning',
        texto: `${res.data.tiktok_username} -> ${res.data.codigo_chat}: ${res.data.mensaje} (Stock restante: ${res.data.stock_restante})`
      });
      setSimUser('');
    } else {
      setSimMensaje({
        tipo: 'error',
        texto: res.error || 'Error al procesar pedido'
      });
    }
  };

  const pedidosAdjudicados = pedidos.filter((p) => p.estado === 'adjudicado');
  const pedidosEspera = pedidos.filter((p) => p.estado === 'espera');
  const totalRecaudado = pedidosAdjudicados.reduce((acc, p) => acc + Number(p.productos?.precio || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Adjudicados (FIFO)</span>
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{pedidosAdjudicados.length}</div>
          <span className="text-xs text-emerald-400 font-medium">Stock asegurado</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Lista de Espera</span>
            <Clock className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{pedidosEspera.length}</div>
          <span className="text-xs text-amber-400 font-medium">Overbooking controlado</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Productos en Vivo</span>
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">{productos.length}</div>
          <span className="text-xs text-slate-400 font-medium">Códigos activos</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ventas Estimadas</span>
            <Zap className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white mt-2">
            ${totalRecaudado.toLocaleString('es-AR')}
          </div>
          <span className="text-xs text-indigo-400 font-medium">Total adjudicado</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed de Pedidos en Tiempo Real */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-red-500" />
                Auditoría en Tiempo Real de Pedidos
              </h2>
              <p className="text-xs text-slate-400">Resolución determinista milimétrica sin disputas</p>
            </div>
            <button
              onClick={() => sesionActual && cargarPedidos(sesionActual.id)}
              className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/60 cursor-pointer"
              title="Refrescar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {pedidos.length === 0 ? (
            <div className="text-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-xl">
              <Users className="w-10 h-10 mx-auto stroke-slate-600 mb-2" />
              <p>Esperando comentarios de compra desde el chat de TikTok...</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="text-xs uppercase bg-slate-950/80 sticky top-0 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Usuario TikTok</th>
                    <th className="px-4 py-3">Código</th>
                    <th className="px-4 py-3">Precio</th>
                    <th className="px-4 py-3">Resolución</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {pedidos.map((pedido) => (
                    <tr key={pedido.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">
                        {new Date(pedido.timestamp_llegada).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          fractionalSecondDigits: 3
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-white">
                        @{pedido.tiktok_username}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-indigo-400">
                        {pedido.productos?.codigo_chat}
                      </td>
                      <td className="px-4 py-3">
                        ${Number(pedido.productos?.precio || 0).toLocaleString('es-AR')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            pedido.estado === 'adjudicado'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {pedido.estado === 'adjudicado' ? 'ADJUDICADO' : 'EN ESPERA'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Panel Lateral: Simulador de Chat & Stock Live */}
        <div className="space-y-6">
          {/* Simulador para testing rápido de concurrencia */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Simular Captura TikTok (Test)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Permite validar la asignación determinista simulando el webhook de la extensión.
            </p>

            <form onSubmit={handleSimularCaptura} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Usuario TikTok</label>
                <input
                  type="text"
                  placeholder="lucas_buyer"
                  value={simUser}
                  onChange={(e) => setSimUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Código de Chat</label>
                <select
                  value={simCodigo}
                  onChange={(e) => setSimCodigo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Selecciona un código...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.codigo_chat}>
                      {p.codigo_chat} ({p.stock_disponible} disponibles)
                    </option>
                  ))}
                </select>
              </div>

              {simMensaje && (
                <div
                  className={`text-xs p-3 rounded-lg border ${
                    simMensaje.tipo === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : simMensaje.tipo === 'warning'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {simMensaje.texto}
                </div>
              )}

              <button
                type="submit"
                disabled={simLoading || !sesionActual}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium py-2 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Simular Comentario en Chat
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Inventario Restante en Vivo */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              Stock de Prendas en Vivo
            </h3>
            <div className="space-y-2">
              {productos.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800"
                >
                  <div className="font-mono font-bold text-sm text-white">{prod.codigo_chat}</div>
                  <div className="text-right">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        prod.stock_disponible === 0
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}
                    >
                      {prod.stock_disponible} disp.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
