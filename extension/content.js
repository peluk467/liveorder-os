/**
 * LiveOrder OS - Content Script para TikTok Live
 * Inyecta MutationObserver, parsea intenciones de compra deterministas y envía pedidos.
 */

(function () {
  console.log('🚀 [LiveOrder OS] Content Script inicializado en TikTok Live');

  // Estado local del script
  let configuracion = {
    auditoriaActiva: false,
    sesionId: null,
    backendUrl: 'http://localhost:3000'
  };

  let observer = null;
  const mensajesProcesados = new Set();
  let pedidosCapturadosCount = 0;

  // Cargar configuración almacenada en storage
  chrome.storage.local.get(['auditoriaActiva', 'sesionId', 'backendUrl'], (result) => {
    configuracion.auditoriaActiva = result.auditoriaActiva ?? false;
    configuracion.sesionId = result.sesionId ?? null;
    configuracion.backendUrl = result.backendUrl ?? 'http://localhost:3000';

    actualizarHUD();
    if (configuracion.auditoriaActiva && configuracion.sesionId) {
      iniciarObservador();
    }
  });

  // Escuchar cambios de configuración desde el popup
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.auditoriaActiva !== undefined) {
      configuracion.auditoriaActiva = changes.auditoriaActiva.newValue;
    }
    if (changes.sesionId !== undefined) {
      configuracion.sesionId = changes.sesionId.newValue;
    }
    if (changes.backendUrl !== undefined) {
      configuracion.backendUrl = changes.backendUrl.newValue;
    }

    actualizarHUD();

    if (configuracion.auditoriaActiva && configuracion.sesionId) {
      iniciarObservador();
    } else {
      detenerObservador();
    }
  });

  // Regex para capturar intenciones de compra (ej: "Mío R38", "Mio 4", "quiero V12", "R38")
  const regexCompra = /(?:^|\b)(?:m[ií]o|quiero|lo\s+quiero|pido)?\s*([A-Za-z]{0,3}\d{1,4}[A-Za-z]?)\b/i;

  /**
   * Extrae username y mensaje de cualquier nodo de chat de TikTok Live
   */
  function extraerDatosMensaje(nodo) {
    if (!nodo || nodo.nodeType !== Node.ELEMENT_NODE) return null;

    // TikTok usa diferentes selectores según la versión del player web
    // Buscamos contenedores de mensaje o texto común
    const textoCompleto = nodo.innerText || nodo.textContent || '';
    if (!textoCompleto.trim()) return null;

    // Intentar buscar username por etiquetas comunes o enlaces de perfil
    let username = 'comprador_anonimo';
    const linkUsuario = nodo.querySelector('a[href*="/@"]') || nodo.querySelector('[data-e2e="chat-message-user-name"]');
    if (linkUsuario) {
      username = linkUsuario.innerText.trim().replace(/^@/, '');
    } else {
      // Fallback: Si el formato es "Username: Comentario"
      const partes = textoCompleto.split(':');
      if (partes.length > 1) {
        username = partes[0].trim().replace(/^@/, '');
      }
    }

    return {
      username,
      texto: textoCompleto
    };
  }

  /**
   * Procesa un nuevo nodo añadido al DOM del chat
   */
  function procesarNuevoElemento(nodo) {
    if (mensajesProcesados.has(nodo)) return;
    mensajesProcesados.add(nodo);

    // Evitar desborde del Set
    if (mensajesProcesados.size > 2000) {
      mensajesProcesados.clear();
    }

    const datos = extraerDatosMensaje(nodo);
    if (!datos) return;

    const match = datos.texto.match(regexCompra);
    if (match && match[1]) {
      const codigoPrenda = match[1].trim().toUpperCase();

      // Descartar palabras comunes que coincidan accidentalmente
      if (['HOLA', 'LIVE', 'TIKTOK', 'GRACIAS', 'SI', 'NO'].includes(codigoPrenda)) {
        return;
      }

      const timestampLlegada = new Date().toISOString();

      console.log(`🎯 [LiveOrder OS] Intención detectada: ${datos.username} -> ${codigoPrenda} (${timestampLlegada})`);

      // Enviar al Background Worker para procesar vía API
      chrome.runtime.sendMessage(
        {
          action: 'ENVIAR_PEDIDO_CAPTURA',
          backendUrl: configuracion.backendUrl,
          payload: {
            sesion_id: configuracion.sesionId,
            codigo_chat: codigoPrenda,
            tiktok_username: datos.username,
            timestamp_llegada: timestampLlegada
          }
        },
        (response) => {
          if (response && response.success) {
            pedidosCapturadosCount++;
            mostrarNotificacionOverlay(
              response.data.data.estado === 'adjudicado' ? 'success' : 'warning',
              `@${datos.username} -> ${codigoPrenda}: ${response.data.data.estado.toUpperCase()}`
            );
            actualizarHUD();
          } else {
            console.warn('[LiveOrder OS] Error al adjudicar:', response?.data?.error || response?.error);
          }
        }
      );
    }
  }

  /**
   * Inicia el MutationObserver en el contenedor del chat
   */
  function iniciarObservador() {
    if (observer) return;

    console.log('👀 [LiveOrder OS] Buscando contenedor de chat de TikTok Live...');

    // Observa el body completo con subtree hasta que el chat se monte
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const addedNode of mutation.addedNodes) {
          if (addedNode.nodeType === Node.ELEMENT_NODE) {
            procesarNuevoElemento(addedNode);
          }
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    console.log('✅ [LiveOrder OS] MutationObserver activo auditando chat');
  }

  function detenerObservador() {
    if (observer) {
      observer.disconnect();
      observer = null;
      console.log('🛑 [LiveOrder OS] MutationObserver detenido');
    }
  }

  // ==========================================
  // HUD Flotante en Pantalla
  // ==========================================
  let hudContainer = null;

  function actualizarHUD() {
    if (!hudContainer) {
      hudContainer = document.createElement('div');
      hudContainer.id = 'liveorder-hud';
      hudContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        background: rgba(15, 23, 42, 0.92);
        color: #fff;
        padding: 10px 16px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        border: 1px solid rgba(255,255,255,0.15);
        font-family: system-ui, sans-serif;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        pointer-events: auto;
      `;
      document.body.appendChild(hudContainer);
    }

    const estaActivo = configuracion.auditoriaActiva && configuracion.sesionId;
    hudContainer.innerHTML = `
      <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${estaActivo ? '#10b981' : '#ef4444'}; box-shadow:0 0 8px ${estaActivo ? '#10b981' : '#ef4444'};"></span>
      <div>
        <strong>LiveOrder OS</strong>: ${estaActivo ? 'Auditando Chat' : 'Pausado'}
        <span style="opacity:0.7; margin-left:6px;">(${pedidosCapturadosCount} pedidos)</span>
      </div>
    `;
  }

  function mostrarNotificacionOverlay(tipo, mensaje) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 30px;
      right: 30px;
      z-index: 999999;
      background: ${tipo === 'success' ? '#059669' : '#d97706'};
      color: #fff;
      padding: 12px 20px;
      border-radius: 10px;
      font-family: system-ui, sans-serif;
      font-size: 13px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      animation: fadeIn 0.3s ease;
    `;
    toast.innerText = mensaje;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3500);
  }
})();
