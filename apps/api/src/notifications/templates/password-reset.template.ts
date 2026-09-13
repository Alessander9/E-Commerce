import { baseTemplate, emailButton } from './base.template';

export function passwordResetEmail(data: {
  firstName: string;
  resetUrl: string;
  expiresIn: string;
}): string {
  const content = `
    <h2 style="color:#111827;font-size:22px;margin:0 0 8px 0;">
      Restablecer Contraseña 🔐
    </h2>

    <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 24px 0;">
      Hola <strong>${data.firstName}</strong>, hemos recibido una solicitud para restablecer tu contraseña.
    </p>

    <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 16px 0;">
      Haz clic en el botón de abajo para crear una nueva contraseña:
    </p>

    ${emailButton('Restablecer Contraseña', data.resetUrl, '#EF4444')}

    <div style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:20px;margin:24px 0;">
      <p style="margin:0;font-size:14px;color:#991b1b;">
        ⏰ <strong>Este enlace expira en ${data.expiresIn}.</strong><br>
        Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
        Tu contraseña no será modificada a menos que hagas clic en el enlace.
      </p>
    </div>
  `;

  return baseTemplate(content, {
    title: 'Restablecer Contraseña',
    preheader: `Solicitud de restablecimiento de contraseña. Enlace válido por ${data.expiresIn}.`,
  });
}
