/**
 * LiveOrder OS - Background Service Worker (Manifest V3)
 * Reenvía las intenciones de compra capturadas al backend evitando bloqueos de CSP.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ENVIAR_PEDIDO_CAPTURA') {
    const { backendUrl, payload } = request;
    const url = `${backendUrl || 'http://localhost:3000'}/api/pedidos/captura`;

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        const data = await res.json();
        sendResponse({ success: res.ok, status: res.status, data });
      })
      .catch((error) => {
        console.error('[LiveOrder Background] Error al enviar pedido:', error);
        sendResponse({ success: false, error: error.message });
      });

    // Retorna true para respuesta asíncrona
    return true;
  }

  if (request.action === 'OBTENER_SESION_ACTIVA') {
    const { backendUrl, vendedorId } = request;
    const url = `${backendUrl || 'http://localhost:3000'}/api/live/activa/${vendedorId}`;

    fetch(url)
      .then(async (res) => {
        const data = await res.json();
        sendResponse({ success: res.ok, data });
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });

    return true;
  }
});
