import { baseTemplate, emailButton, infoBox } from './base.template';

export function welcomeEmail(data: {
  firstName: string;
  tenantName: string;
  loginUrl: string;
}): string {
  const content = `
    <h2 style="color:#111827;font-size:22px;margin:0 0 16px 0;">
      ¡Bienvenido/a, ${data.firstName}! 🎉
    </h2>

    <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Tu cuenta ha sido creada exitosamente en <strong>${data.tenantName}</strong>.
      Ya puedes comenzar a explorar nuestros productos y realizar tus compras.
    </p>

    ${infoBox('Tu tienda', data.tenantName)}

    <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 16px 0;">
      Haz clic en el botón de abajo para acceder a tu cuenta:
    </p>

    ${emailButton('Iniciar Sesión', data.loginUrl)}

    <p style="color:#9ca3af;font-size:13px;line-height:1.5;margin:24px 0 0 0;">
      Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.
    </p>
  `;

  return baseTemplate(content, {
    title: `¡Bienvenido/a a ${data.tenantName}!`,
    preheader: `Tu cuenta ha sido creada. ¡Explora nuestros productos!`,
  });
}
