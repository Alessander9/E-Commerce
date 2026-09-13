import { baseTemplate, emailButton, infoBox } from './base.template';

export function shippingNotificationEmail(data: {
  firstName: string;
  orderNumber: string;
  courier: string;
  trackingCode: string;
  trackingUrl?: string;
  tenantName: string;
  ordersUrl: string;
}): string {
  const content = `
    <h2 style="color:#111827;font-size:22px;margin:0 0 8px 0;">
      ¡Tu pedido va en camino! 🚚
    </h2>

    <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Hola <strong>${data.firstName}</strong>, tu pedido ha sido despachado y está en camino.
    </p>

    ${infoBox('Número de Pedido', data.orderNumber)}
    ${infoBox('Courier', data.courier)}
    ${infoBox('Código de Seguimiento', data.trackingCode)}

    ${data.trackingUrl ? `
    <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 16px 0;">
      Puedes rastrear tu paquete en el sitio del courier:
    </p>
    ${emailButton('Rastrear Paquete', data.trackingUrl, '#1976FF')}
    ` : ''}

    <div style="background-color:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin:24px 0;">
      <p style="margin:0;font-size:14px;color:#1e40af;">
        📦 <strong>Tu pedido está siendo preparado</strong> y será entregado en los próximos días hábiles.
        Te mantendremos informado sobre el estado de tu envío.
      </p>
    </div>

    ${emailButton('Ver Mis Pedidos', data.ordersUrl, '#6A2CFF')}
  `;

  return baseTemplate(content, {
    title: `Pedido ${data.orderNumber} despachado`,
    preheader: `Tu pedido #${data.orderNumber} con ${data.courier} está en camino. Tracking: ${data.trackingCode}`,
  });
}
