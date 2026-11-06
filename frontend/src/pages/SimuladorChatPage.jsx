import React, { useState } from 'react';
import { useLiveStore } from '../store/useLiveStore';
import { MessageSquare, Send, Sparkles, AlertTriangle } from 'lucide-react';

export const SimuladorChatPage = () => {
  const { productos, sesionActual } = useLiveStore();
  const [mensajes, setMensajes] = useState([
    { id: 1, usuario: 'tiktok_fan_99', texto: 'Hola qué tal!' },
    { id: 2, usuario: 'mari_moda', texto: 'Qué talles tienen?' }
  ]);
  const [nuevoUsuario, setNuevoUsuario] = useState('comprador_live');
  const [nuevoTexto, setNuevoTexto] = useState('Mío R38');

  const agregarMensajeAlDOM = (usuario, texto) => {
    setMensajes((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        usuario,
        texto
      }
    ]);
  };

  const handleEnviar = (e) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;
    agregarMensajeAlDOM(nuevoUsuario, nuevoTexto);
    setNuevoTexto('');
  };

  const simularRafagaConcurrente = (codigo) => {
    const usuarios = ['lucas_buyer', 'carolina_trendy', 'agustin_23', 'valentina_chic', 'marcos_live'];
    usuarios.forEach((usr, index) => {
      setTimeout(() => {
        agregarMensajeAlDOM(usr, `Mío ${codigo}`);
      }, index * 200); // 200ms entre cada mensaje simulando un chat en vivo real
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
          <div>
            <h1 className="text-xl font-bold text-white">
              Entorno de Pruebas: Simulación del DOM de TikTok Live
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Esta pantalla emite nodos idénticos al chat real de TikTok. Si la <strong>Extensión de Chrome</strong> está cargada y activa en el navegador, verás el badge flotante <strong>"LiveOrder OS: Auditando Chat"</strong> abajo a la derecha y los pedidos se adjudicarán automáticamente por el MutationObserver.
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
            <span className="text-xs text-slate-500">{mensajes.length} mensajes en buffer</span>
          </div>

          {/* Área de mensajes con selectores que lee content.js */}
          <div id="tiktok-chat-container" className="flex-1 overflow-y-auto py-4 space-y-3 font-sans">
            {mensajes.map((m) => (
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
                  @{m.usuario}
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
              className="bg-pink-600 hover:bg-pink-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
                    className="w-full text-left bg-slate-950 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between"
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
