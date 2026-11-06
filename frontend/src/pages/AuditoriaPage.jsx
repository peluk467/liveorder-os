import React, { useEffect, useState } from 'react';
import { useLiveStore } from '../store/useLiveStore';
import {
  History,
  Calendar,
  Clock,
  DollarSign,
  Package,
  Users,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Radio,
  Phone
} from 'lucide-react';

export const AuditoriaPage = () => {
  const { historialAuditoria, cargarHistorialAuditoria } = useLiveStore();
  const [sesionAbierta, setSesionAbierta] = useState(null);

  useEffect(() => {
    cargarHistorialAuditoria();
  }, []);

  const totalHistorico = historialAuditoria.reduce((acc, s) => acc + (s.total_ventas || 0), 0);
  const totalPrendasHistoricas = historialAuditoria.reduce((acc, s) => acc + (s.prendas_adjudicadas || 0), 0);

  const toggleSesion = (id) => {
    setSesionAbierta((prev) => (prev === id ? null : id));
  };

  const enviarWhatsAppComprador = (comprador, fechaLive) => {
    const prendasTexto = comprador.items.join(', ');
    const textoMensaje = encodeURIComponent(
      `🎉 ¡Hola @${comprador.username}! Te escribimos de la transmisión en vivo (${fechaLive}):\n\n👕 *Tus prendas adjudicadas:* ${prendasTexto}\n💵 *Total a pagar:* $${comprador.total.toLocaleString('es-AR')} ARS\n\n💳 *Link de pago seguro (MercadoPago):*\nhttps://mpago.la/demo\n\n¡Por favor confírmanos tu dirección para preparar el envío!`
    );

    if (comprador.telefono) {
      // Formatear si viene sin código de país (asume Argentina 549 si tiene 10 dígitos)
      let num = comprador.telefono.replace(/\D/g, '');
      if (num.length === 10) num = '549' + num;
      window.open(`https://wa.me/${num}?text=${textoMensaje}`, '_blank');
    } else {
      // Fallback
      const manualNum = prompt(`El usuario @${comprador.username} no especificó teléfono en el chat. Ingresa su número para abrir WhatsApp:`);
      if (manualNum) {
        let num = manualNum.replace(/\D/g, '');
        if (num.length === 10) num = '549' + num;
        window.open(`https://wa.me/${num}?text=${textoMensaje}`, '_blank');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-6 h-6 text-purple-400" />
            Panel de Auditoría de Lives
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Historial cronológico auditado de todas tus transmisiones en vivo, ventas y números de contacto.
          </p>
        </div>

        <button
          onClick={cargarHistorialAuditoria}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 transition-all cursor-pointer"
        >
          Actualizar Historial
        </button>
      </div>

      {/* Métricas Globales Históricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Total Histórico Recaudado</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-2">
            ${totalHistorico.toLocaleString('es-AR')}
          </div>
          <span className="text-xs text-slate-400">En {historialAuditoria.length} transmisiones</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Prendas Adjudicadas</span>
          <div className="text-3xl font-extrabold text-white mt-2">
            {totalPrendasHistoricas} u.
          </div>
          <span className="text-xs text-slate-400">Vendidas sin sobreventa</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <span className="text-xs font-semibold uppercase text-slate-400">Transmisiones Realizadas</span>
          <div className="text-3xl font-extrabold text-purple-400 mt-2">
            {historialAuditoria.length}
          </div>
          <span className="text-xs text-slate-400">Auditorías registradas en base de datos</span>
        </div>
      </div>

      {/* Listado de Lives */}
      <div className="space-y-4">
        {historialAuditoria.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            <Radio className="w-10 h-10 mx-auto stroke-slate-600 mb-2" />
            <p className="text-base font-medium">Aún no hay transmisiones en el historial.</p>
            <p className="text-xs text-slate-500 mt-1">Inicia una sesión en Pre-Live para generar tu primera auditoría.</p>
          </div>
        ) : (
          historialAuditoria.map((live) => {
            const fechaObj = new Date(live.fecha_hora_inicio);
            const fechaStr = fechaObj.toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
            const horaStr = fechaObj.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit'
            });
            const isOpen = sesionAbierta === live.id;

            return (
              <div
                key={live.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden transition-all"
              >
                {/* Header Acordeón del Live */}
                <div
                  onClick={() => toggleSesion(live.id)}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-500/10 p-2.5 rounded-xl text-purple-400 border border-purple-500/20">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">
                          Live del {fechaStr} a las {horaStr} hs
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            live.estado === 'activa'
                              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {live.estado === 'activa' ? 'EN VIVO' : 'FINALIZADA'}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500">ID: {live.id}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Ventas Totales</span>
                      <span className="font-extrabold text-emerald-400 text-base">
                        ${live.total_ventas.toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-slate-400 block">Compradores</span>
                      <span className="font-bold text-white text-sm">
                        {live.total_compradores}
                      </span>
                    </div>

                    <div className="text-right hidden sm:block">
                      <span className="text-xs text-slate-400 block">Prendas</span>
                      <span className="font-bold text-white text-sm">
                        {live.prendas_adjudicadas} u.
                      </span>
                    </div>

                    <div className="text-slate-400">
                      {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Detalle Desplegable del Live */}
                {isOpen && (
                  <div className="border-t border-slate-800 p-6 bg-slate-950/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                        Compradores y Adjudicaciones Auditadas ({live.compradores.length})
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">
                        {live.demanda_espera} pedidos en lista de espera
                      </span>
                    </div>

                    {live.compradores.length === 0 ? (
                      <p className="text-sm text-slate-500 py-4 text-center">
                        No se registraron ventas adjudicadas en esta transmisión.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-300">
                          <thead className="text-xs uppercase bg-slate-950/80 text-slate-400 border-b border-slate-800">
                            <tr>
                              <th className="px-4 py-2.5 font-semibold">Comprador TikTok</th>
                              <th className="px-4 py-2.5 font-semibold">Prendas Asignadas</th>
                              <th className="px-4 py-2.5 font-semibold">Cantidad</th>
                              <th className="px-4 py-2.5 font-semibold">Hora Compra</th>
                              <th className="px-4 py-2.5 font-semibold">Número WhatsApp</th>
                              <th className="px-4 py-2.5 font-semibold">Monto Total</th>
                              <th className="px-4 py-2.5 font-semibold text-right">Contacto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/80">
                            {live.compradores.map((comp) => {
                              const horaCompra = comp.primera_compra
                                ? new Date(comp.primera_compra).toLocaleTimeString('es-AR', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit'
                                  })
                                : '--:--:--';

                              return (
                                <tr key={comp.username} className="hover:bg-slate-900/60 transition-colors">
                                  <td className="px-4 py-3 font-semibold text-white">
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
                                  <td className="px-4 py-3 text-slate-400">
                                    {comp.items.length} prenda(s)
                                  </td>
                                  <td className="px-4 py-3 font-mono text-xs text-slate-400">
                                    {horaCompra}
                                  </td>
                                  <td className="px-4 py-3">
                                    {comp.telefono ? (
                                      <span className="inline-flex items-center gap-1.5 font-mono text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-lg">
                                        <Phone className="w-3 h-3" />
                                        {comp.telefono}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-500 italic">No especificado</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 font-bold text-emerald-400">
                                    ${comp.total.toLocaleString('es-AR')}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() => enviarWhatsAppComprador(comp, fechaStr)}
                                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all shadow-sm shadow-emerald-600/30"
                                      title="Abrir chat en WhatsApp"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      Mandar al WhatsApp
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
