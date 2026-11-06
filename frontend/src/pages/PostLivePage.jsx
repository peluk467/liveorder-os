import React, { useEffect } from 'react';
import { useLiveStore } from '../store/useLiveStore';
import { BarChart3, Download, MessageSquare, CheckCircle, PowerOff } from 'lucide-react';

export const PostLivePage = () => {
  const {
    sesionActual,
    pedidos,
    cargarSesionActiva,
    cargarPedidos,
    finalizarSesion
  } = useLiveStore();

  useEffect(() => {
    cargarSesionActiva();
    if (sesionActual?.id) {
      cargarPedidos(sesionActual.id);
    }
  }, [sesionActual?.id]);

  const adjudicados = pedidos.filter((p) => p.estado === 'adjudicado');
  const enEspera = pedidos.filter((p) => p.estado === 'espera');

  // Consolidar por comprador de TikTok (agrupación de prendas)
  const pedidosPorComprador = adjudicados.reduce((acc, p) => {
    const user = p.tiktok_username;
    if (!acc[user]) {
      acc[user] = {
        username: user,
        items: [],
        total: 0
      };
    }
    acc[user].items.push(p.productos?.codigo_chat);
    acc[user].total += Number(p.productos?.precio || 0);
    return acc;
  }, {});

  const listaCompradores = Object.values(pedidosPorComprador);
  const totalRecaudacion = listaCompradores.reduce((acc, c) => acc + c.total, 0);

  const exportarCSV = () => {
    const headers = ['Usuario_TikTok', 'Prendas', 'Total_ARS', 'Estado'];
    const rows = listaCompradores.map((c) => [
      `@${c.username}`,
      `"${c.items.join(', ')}"`,
      c.total,
      'Listo_Para_Cobro'
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `liveorder_cierre_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Cierre Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Cierre Post-Live y Consolidación de Cobros
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Matriz de compradores y prendas adjudicadas listas para enviar links de pago.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportarCSV}
            disabled={listaCompradores.length === 0}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>

          {sesionActual?.estado === 'activa' && (
            <button
              onClick={finalizarSesion}
              className="flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer"
            >
              <PowerOff className="w-4 h-4" />
              Finalizar Sesión Live
            </button>
          )}
        </div>
      </div>

      {/* Resumen Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Total a Cobrar</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            ${totalRecaudacion.toLocaleString('es-AR')}
          </div>
          <span className="text-xs text-slate-400">En {listaCompradores.length} compradores únicos</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Prendas Adjudicadas</span>
          <div className="text-3xl font-extrabold text-white mt-2">{adjudicados.length} u.</div>
          <span className="text-xs text-slate-400">Cero sobreventa</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Demanda No Satisfecha</span>
          <div className="text-3xl font-extrabold text-amber-400 mt-2">{enEspera.length}</div>
          <span className="text-xs text-slate-400">Usuarios en lista de espera</span>
        </div>
      </div>

      {/* Tabla Consolidada por Comprador */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">
          Matriz de Compradores y Cobro ({listaCompradores.length})
        </h2>

        {listaCompradores.length === 0 ? (
          <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
            <p>No se registraron ventas adjudicadas en esta sesión aún.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-semibold">Comprador</th>
                  <th className="px-4 py-3 font-semibold">Prendas Asignadas</th>
                  <th className="px-4 py-3 font-semibold">Cantidad</th>
                  <th className="px-4 py-3 font-semibold">Monto Total</th>
                  <th className="px-4 py-3 font-semibold text-right">Acción Cobro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {listaCompradores.map((comp) => (
                  <tr key={comp.username} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-white">
                      @{comp.username}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {comp.items.map((it, idx) => (
                          <span
                            key={idx}
                            className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded text-xs font-mono font-bold"
                          >
                            {it}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{comp.items.length} prenda(s)</td>
                    <td className="px-4 py-3 font-bold text-emerald-400">
                      ${comp.total.toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => alert(`Enviando notificación a @${comp.username} (Fase 6: n8n + Evolution API)`)}
                        className="inline-flex items-center gap-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Cobrar WhatsApp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
