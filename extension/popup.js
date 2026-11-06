document.addEventListener('DOMContentLoaded', () => {
  const toggleAuditoria = document.getElementById('toggle-auditoria');
  const inputSesion = document.getElementById('input-sesion');
  const inputBackend = document.getElementById('input-backend');
  const btnGuardar = document.getElementById('btn-guardar');
  const btnDetectar = document.getElementById('btn-detectar');
  const badgeStatus = document.getElementById('badge-status');
  const msgFeedback = document.getElementById('msg-feedback');

  const VENDEDOR_ID = '00000000-0000-0000-0000-000000000001';

  // 1. Cargar estado actual
  chrome.storage.local.get(['auditoriaActiva', 'sesionId', 'backendUrl'], (result) => {
    if (result.auditoriaActiva) {
      toggleAuditoria.checked = true;
      actualizarBadge(true);
    } else {
      actualizarBadge(false);
    }

    if (result.sesionId) inputSesion.value = result.sesionId;
    if (result.backendUrl) inputBackend.value = result.backendUrl;
  });

  function actualizarBadge(activo) {
    if (activo) {
      badgeStatus.innerText = 'Auditando';
      badgeStatus.className = 'badge active';
    } else {
      badgeStatus.innerText = 'Inactivo';
      badgeStatus.className = 'badge';
    }
  }

  // 2. Guardar cambios en el Toggle
  toggleAuditoria.addEventListener('change', () => {
    const activo = toggleAuditoria.checked;
    chrome.storage.local.set({ auditoriaActiva: activo }, () => {
      actualizarBadge(activo);
      mostrarFeedback(activo ? 'Auditoría activada' : 'Auditoría pausada');
    });
  });

  // 3. Botón para detectar automáticamente la sesión desde el backend
  btnDetectar.addEventListener('click', async () => {
    const backendUrl = inputBackend.value.trim() || 'http://localhost:3000';
    mostrarFeedback('Buscando sesión activa en backend...');

    chrome.runtime.sendMessage(
      {
        action: 'OBTENER_SESION_ACTIVA',
        backendUrl,
        vendedorId: VENDEDOR_ID
      },
      (res) => {
        if (res && res.success && res.data && res.data.data) {
          const sesion = res.data.data;
          inputSesion.value = sesion.id;
          chrome.storage.local.set({ sesionId: sesion.id });
          mostrarFeedback(`¡Sesión detectada y vinculada! (${sesion.id.slice(0, 8)})`);
        } else {
          mostrarFeedback('No se encontró ninguna sesión activa en el backend.');
        }
      }
    );
  });

  // 4. Guardar configuración manual
  btnGuardar.addEventListener('click', () => {
    const sesionId = inputSesion.value.trim();
    const backendUrl = inputBackend.value.trim() || 'http://localhost:3000';

    chrome.storage.local.set(
      {
        sesionId,
        backendUrl
      },
      () => {
        mostrarFeedback('Configuración guardada correctamente.');
      }
    );
  });

  function mostrarFeedback(texto) {
    msgFeedback.innerText = texto;
    setTimeout(() => {
      if (msgFeedback.innerText === texto) msgFeedback.innerText = '';
    }, 4000);
  }
});
