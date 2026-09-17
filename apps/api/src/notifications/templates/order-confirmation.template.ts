import { baseTemplate, emailButton, infoBox } from './base.template';

export function orderConfirmationEmail(data: {
  firstName: string;
  orderNumber: string;
  items: Array<{ name: string; quantity: number; unitPrice: number }>;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  currency: string;
  shippingAddress: string;
  tenantName: string;
  orderUrl: string;
}): string {
  const currencySymbol = 'S/ ';

  const itemsHtml = data.items.map((item) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;">
        <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${item.name}</p>
        <p style="margin:4px 0 0 0;font-size:13px;color:#6b7280;">Cantidad: ${item.quantity} × ${currencySymbol}${item.unitPrice.toFixed(2)}</p>
      </td>
      <td style="padding:12px 0;border-bottom:1px solid #f3f4f6;text-align:right;">
        <p style="margin:0;font-size:15px;font-weight:600;color:#111827;">${currencySymbol}${(item.unitPrice * item.quantity).toFixed(2)}</p>
      </td>
    </tr>
  `).join('');

  const content = `
    <h2 style="color:#111827;font-size:22px;margin:0 0 8px 0;">
      ¡Pedido Confirmado! ✅
    </h2>

    <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Hola <strong>${data.firstName}</strong>, tu pedido ha sido registrado exitosamente.
    </p>

    ${infoBox('Número de Pedido', data.orderNumber)}

    <!-- Items -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
      <tr>
        <td style="padding:0 0 8px 0;border-bottom:2px solid #111827;">
          <p style="margin:0;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Producto</p>
        </td>
        <td style="padding:0 0 8px 0;border-bottom:2px solid #111827;text-align:right;">
          <p style="margin:0;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Subtotal</p>
        </td>
      </tr>
      ${itemsHtml}
    </table>

    <!-- Totals -->
    <div style="border-top:2px solid #e5e7eb;padding-top:16px;margin:16px 0;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:4px 0;"><span style="color:#6b7280;font-size:14px;">Subtotal</span></td>
          <td style="padding:4px 0;text-align:right;"><span style="font-size:14px;color:#111827;">${currencySymbol}${data.subtotal.toFixed(2)}</span></td>
        </tr>
        <tr>
          <td style="padding:4px 0;"><span style="color:#6b7280;font-size:14px;">Envío</span></td>
          <td style="padding:4px 0;text-align:right;"><span style="font-size:14px;color:#111827;">${currencySymbol}${data.shippingCost.toFixed(2)}</span></td>
        </tr>
        ${data.discountAmount > 0 ? `
        <tr>
          <td style="padding:4px 0;"><span style="color:#22c55e;font-size:14px;">Descuento</span></td>
          <td style="padding:4px 0;text-align:right;"><span style="font-size:14px;color:#22c55e;">-${currencySymbol}${data.discountAmount.toFixed(2)}</span></td>
        </tr>
        ` : ''}
        <tr>
          <td style="padding:12px 0 0 0;border-top:2px solid #111827;"><strong style="font-size:18px;color:#111827;">Total</strong></td>
          <td style="padding:12px 0 0 0;border-top:2px solid #111827;text-align:right;"><strong style="font-size:18px;color:#6A2CFF;">${currencySymbol}${data.total.toFixed(2)}</strong></td>
        </tr>
      </table>
    </div>

    ${infoBox('Dirección de Envío', data.shippingAddress)}

    ${emailButton('Ver Mi Pedido', data.orderUrl, '#1976FF')}

    <p style="color:#9ca3af;font-size:13px;line-height:1.5;margin:24px 0 0 0;">
      Recibirás otro correo cuando tu pedido sea despachado.
    </p>
  `;

  return baseTemplate(content, {
    title: `Pedido ${data.orderNumber} confirmado`,
    preheader: `Tu pedido #${data.orderNumber} por ${currencySymbol}${data.total.toFixed(2)} ha sido confirmado.`,
  });
}
