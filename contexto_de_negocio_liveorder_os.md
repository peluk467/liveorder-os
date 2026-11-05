# Contexto de Negocio y Visión General: LiveOrder OS

Este documento proporciona el contexto comercial, el público objetivo y la justificación funcional de **LiveOrder OS**, un proyecto académico (UNJU 2026 - Legislación y Ejercicio Profesional) que busca convertirse en un producto SaaS real. 

**IA, lee este documento para entender el "por qué" detrás del código y las decisiones de arquitectura.**

## 1. ¿Qué es LiveOrder OS?
Es una plataforma SaaS orientada al *Social Commerce* (específicamente TikTok Live). Funciona como una herramienta de automatización y gestión de ventas en tiempo real que resuelve el caos operativo que sufren los vendedores independientes cuando realizan transmisiones en vivo.

## 2. El Problema (Pain Points)
Actualmente, los vendedores de indumentaria y accesorios en TikTok Live gestionan sus pedidos de forma 100% manual (leyendo el chat y anotando en un cuaderno). Esto genera:
*   **Pérdida de Ventas:** El chat va tan rápido que se pierde hasta un 30% de los pedidos legítimos.
*   **Pérdida de Tiempo (Post-Live):** El vendedor gasta de 2 a 3 horas después del vivo revisando grabaciones para pasar en limpio los pedidos y cobrar.
*   **Sobrevendido de Stock:** Se prometen productos que ya no tienen stock físico, arruinando la reputación.
*   **Disputas en Vivo:** Los clientes se pelean en el chat argumentando "yo comenté primero", lo que genera desconfianza.

## 3. La Solución y Ventaja Competitiva
LiveOrder OS se inyecta como una extensión de navegador (Overlay) junto a la pantalla de transmisión. 
*   Audita el chat en tiempo real buscando palabras clave (ej: "Mío 4").
*   Aplica un algoritmo de prelación temporal estricto (adjudica al primer comentario que llega al servidor).
*   Bloquea automáticamente el inventario agotado.
*   Al finalizar, exporta una matriz consolidada con los pedidos listos para enviar links de cobro por WhatsApp.

**Ventaja frente a alternativas (TikTok Shop / Tiendas Web):**
Cero fricción. No requiere trámites fiscales complejos ni cobra comisiones altas por venta. Es una suscripción mensual fija y el vendedor sigue cobrando por sus métodos habituales.

## 4. Público Objetivo
Microempresarios, vendedores independientes y emprendedores (principalmente rubro indumentaria y calzado) que usan TikTok Live como canal principal de ventas directas.

## 5. El Núcleo del Sistema: Automatización Determinista
Este es el concepto más crítico del proyecto. El sistema **NO utiliza Inteligencia Artificial probabilística** para decidir a quién venderle. 
*   **Regla Matemática Estricta:** Implementa **Automatización Determinista**. Si hay 2 remeras y 5 personas comentan, el sistema sigue una regla FIFO (First-In, First-Out). Los dos primeros usuarios registrados en milisegundos se quedan con el stock; los otros tres son rechazados. A igual condición de entrada, siempre hay un resultado exacto y auditable para terminar con las peleas en el chat.

## 6. Flujo de Experiencia de Usuario (User Journey)
1.  **Pre-Live:** El vendedor carga su inventario, códigos de prendas (ej: "R38") y stock inicial en el panel.
2.  **Durante el Live:** La extensión detecta intenciones de compra en el chat. El vendedor hace clic en "Adjudicar" desde el panel lateral sin dejar de mirar la transmisión.
3.  **Post-Live (Cierre):** El sistema exporta el reporte y, mediante un flujo automatizado (Webhook a n8n), envía mensajes masivos de WhatsApp con el monto y el link de pago (MercadoPago) a cada comprador.