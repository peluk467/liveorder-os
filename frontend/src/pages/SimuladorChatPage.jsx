import React, { useState } from 'react';
import { useLiveStore } from '../store/useLiveStore';
import { MessageSquare, Send, Sparkles, AlertTriangle, Trash2 } from 'lucide-react';

export const SimuladorChatPage = () => {
  const {
    productos,
    sesionActual,
    mensajesSimulador,
    agregarMensajeSimulador,
    limpiarMensajesSimulador,
    capturarPedido
  } = useLiveStore();

  const [nuevoUsuario, setNuevoUsuario] = useState('comprador_live');
  const [nuevoTexto, setNuevoTexto] = useState('ROJO 3881323456');
  const [enviando, setEnviando] = useState(false);

  const parsearComentarioCompra = (texto) => {
    if (!texto || !texto.trim()) return null;

    const textoTrim = texto.trim();

    // 1. Extraer teléfono si está presente (8 a 13 dígitos)
    const matchTel = textoTrim.match(/(?:\+?\d{1,3})?\s*(?:9\s*)?(\d{8,12})\b/);
    const telefono = matchTel ? matchTel[0].replace(/\s+/g, '') : null;

    // 2. Extraer código de prenda aislando el teléfono
    const textoSinTel = matchTel ? textoTrim.replace(matchTel[0], ' ') : textoTrim;

    // 3. Limpiar prefijos opcionales si alguien pone "mío", "mio", etc.
    const textoLimpio = textoSinTel
      .replace(/(?:^|\b)(?:m[ií]o|quiero|lo\s+quiero|pido|yo)\b/gi, '')
      .trim();

    // 4. Extraer token del código (ej: ROJO, rojo, R38, V04)
    const tokens = textoLimpio.split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return null;

    const codigo = tokens[0].trim().toUpperCase();

    if (!['HOLA', 'LIVE', 'TIKTOK', 'GRACIAS', 'SI', 'NO', 'BUENAS'].includes(codigo)) {
      return { codigo, telefono };
    }
    return null;
  };

  const procesarMensaje = async (usuario, texto) => {
    // 1. Guardar y pintar en el DOM
    agregarMensajeSimulador({
      id: Date.now() + Math.random(),
      usuario,
      texto
    });

    // 2. Extraer intención determinista (prenda + teléfono de WhatsApp)
    const datosCompra = parsearComentarioCompra(texto);

    if (datosCompra) {
      // Asegurar que hay sesión activa para adjudicar
      let sesion = sesionActual;
      if (!sesion) {
        await useLiveStore.getState().cargarSesionActiva();
        sesion = useLiveStore.getState().sesionActual;
        if (!sesion) {
          sesion = await useLiveStore.getState().iniciarSesion();
        }
      }

      await capturarPedido({
        codigo_chat: datosCompra.codigo,
        tiktok_username: usuario,
        telefono: datosCompra.telefono
      });
    }
  };

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!nuevoTexto.trim() || enviando) return;
    setEnviando(true);
    await procesarMensaje(nuevoUsuario, nuevoTexto);
    setNuevoTexto('');
    setEnviando(false);
  };

  const simularRafagaConcurrente = (codigo) => {
    const usuarios = [
      { user: 'lucas_buyer', tel: '3884112233', variacion: codigo.toUpperCase() },
      { user: 'carolina_trendy', tel: '3885998877', variacion: codigo.toLowerCase() },
      { user: 'agustin_23', tel: '3884001122', variacion: codigo.toUpperCase() },
      { user: 'valentina_chic', tel: '3886554433', variacion: codigo.toLowerCase() },
      { user: 'marcos_live', tel: '3887112233', variacion: codigo.toUpperCase() }
    ];

    usuarios.forEach((item, index) => {
      setTimeout(() => {
        // Comentarios directos sin 'Mío', en mayúsculas y minúsculas con teléfono
        procesarMensaje(item.user, `${item.variacion} ${item.tel}`);
      }, index * 250);
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner Explicativo */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-white">
                Entorno de Pruebas: Simulación del DOM de TikTok Live
              </h1>
              {mensajesSimulador.length > 0 && (
                <button
                  onClick={limpiarMensajesSimulador}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 p-1.5 rounded-lg border border-slate-800 hover:border-red-500/30 transition-all cursor-pointer"
                  title="Vaciar chat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Limpiar Chat
                </button>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Los mensajes se mantienen persistentes y se procesan automáticamente con el algoritmo determinista FIFO.
            </p>
          </div>
        </div>

        {!sesionActual && (
          <div className="mt-4 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs p-3 rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Recuerda haber iniciado una sesión en <strong>Pre-Live</strong> antes de probar.</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contenedor del Chat (Simulación de TikTok) */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col h-[520px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-pink-500" />
              TikTok Live Chat DOM
            </span>
            <span className="text-xs text-slate-500">{mensajesSimulador.length} mensajes en buffer</span>
          </div>

          {/* Área de mensajes con selectores que lee content.js */}
          <div id="tiktok-chat-container" className="flex-1 overflow-y-auto py-4 space-y-3 font-sans">
            {mensajesSimulador.map((m) => (
              <div
                key={m.id}
                className="chat-message-item bg-slate-900/50 border border-slate-800/80 rounded-xl px-3.5 py-2 text-sm flex items-start gap-2.5 transition-all"
              >
                <a
                  href={`https://www.tiktok.com/@${m.usuario}`}
                  target="_blank"
                  rel="noreferrer"
                  data-e2e="chat-message-user-name"
                  className="font-semibold text-pink-400 hover:underline shrink-0"
                >
                  @{m.usuario}:
                </a>
                <span className="text-slate-200 break-words">{m.texto}</span>
              </div>
            ))}
          </div>

          {/* Formulario de Input en Vivo */}
          <form onSubmit={handleEnviar} className="pt-3 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Usuario"
              value={nuevoUsuario}
              onChange={(e) => setNuevoUsuario(e.target.value)}
              className="w-36 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
            />
            <input
              type="text"
              placeholder="Escribe en el chat (Ej: Mío R38)..."
              value={nuevoTexto}
              onChange={(e) => setNuevoTexto(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500"
            />
            <button
              type="submit"
              disabled={enviando || !sesionActual}
              className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              Comentar
            </button>
          </form>
        </div>

        {/* Panel de Ráfaga de Concurrencia */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-400 mb-2">
              Test de Concurrencia Real
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Dispara 5 compradores en milisegundos con el mismo código para observar la adjudicación determinista de la extensión.
            </p>

            <div className="space-y-2.5">
              {productos.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs">
                  No hay prendas cargadas en la sesión.
                </div>
              ) : (
                productos.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => simularRafagaConcurrente(prod.codigo_chat)}
                    disabled={!sesionActual}
                    className="w-full text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between disabled:opacity-50"
                  >
                    <div>
                      <span className="font-mono font-bold text-white text-sm">{prod.codigo_chat}</span>
                      <span className="block text-xs text-slate-400">Stock: {prod.stock_disponible} disp.</span>
                    </div>
                    <span className="text-xs bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-2.5 py-1 rounded-lg font-semibold">
                      Lanzar Ráfaga
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
