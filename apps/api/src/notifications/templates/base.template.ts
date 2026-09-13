/**
 * Base HTML email template with Cleo Platform branding.
 *
 * Color palette:
 *   Primary:   #6A2CFF (purple)
 *   Secondary: #1976FF (blue)
 *   Success:   #22C55E (green)
 *   Error:     #EF4444 (red)
 *   Warning:   #F59E0B (amber)
 */

export function baseTemplate(content: string, options?: {
  title?: string;
  preheader?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options?.title || 'Cleo Platform'}</title>
  ${options?.preheader ? `<meta name="preheader" content="${options.preheader}">` : ''}
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <!-- Preheader text (hidden) -->
  <div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${options?.preheader || ''}
  </div>

  <!-- Main container -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6A2CFF 0%,#1976FF 100%);padding:32px 40px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="color:#ffffff;font-size:24px;margin:0;font-weight:700;letter-spacing:-0.5px;">
                ✨ Cleo Platform
              </h1>
              <p style="color:rgba(255,255,255,0.85);font-size:14px;margin:8px 0 0 0;">
                ${options?.title || 'Notificación'}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;border-radius:0 0 12px 12px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} Cleo Platform. Todos los derechos reservados.
              </p>
              <p style="color:#9ca3af;font-size:11px;margin:8px 0 0 0;">
                Este es un correo generado automáticamente. Por favor no respondas a este mensaje.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Button helper for email templates.
 */
export function emailButton(text: string, url: string, color: string = '#6A2CFF'): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px auto;">
      <tr>
        <td style="background-color:${color};border-radius:8px;">
          <a href="${url}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

/**
 * Info box helper.
 */
export function infoBox(label: string, value: string): string {
  return `
    <div style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:12px 0;">
      <p style="margin:0;font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">${label}</p>
      <p style="margin:4px 0 0 0;font-size:16px;font-weight:600;color:#111827;">${value}</p>
    </div>
  `;
}
