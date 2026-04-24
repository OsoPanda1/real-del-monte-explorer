interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailResult {
  delivered: boolean;
  provider: 'log' | 'webhook';
  message: string;
}

const DEFAULT_TIMEOUT_MS = 8_000;

const buildTextFromHtml = (html: string): string =>
  html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export async function sendTransactionalEmail(input: SendEmailInput): Promise<EmailResult> {
  const webhook = process.env.EMAIL_WEBHOOK_URL;

  if (!webhook) {
    console.log('[EMAIL:LOG]', {
      to: input.to,
      subject: input.subject,
      preview: (input.text || buildTextFromHtml(input.html)).slice(0, 180),
    });
    return {
      delivered: false,
      provider: 'log',
      message: 'EMAIL_WEBHOOK_URL is not configured. Message was logged only.',
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.EMAIL_WEBHOOK_TOKEN
          ? { Authorization: `Bearer ${process.env.EMAIL_WEBHOOK_TOKEN}` }
          : {}),
      },
      body: JSON.stringify({
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text || buildTextFromHtml(input.html),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.text();
      return {
        delivered: false,
        provider: 'webhook',
        message: `Webhook error ${response.status}: ${body.slice(0, 180)}`,
      };
    }

    return {
      delivered: true,
      provider: 'webhook',
      message: 'Email dispatched via webhook provider',
    };
  } catch (error) {
    return {
      delivered: false,
      provider: 'webhook',
      message: error instanceof Error ? error.message : 'Unknown webhook error',
    };
  } finally {
    clearTimeout(timer);
  }
}

export function buildPasswordResetEmail(resetUrl: string) {
  return {
    subject: 'Recupera tu contraseña de RDM Digital',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:560px;margin:auto">
        <h2 style="margin-bottom:8px">Recuperación de contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña en <strong>RDM Digital</strong>.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
            Restablecer contraseña
          </a>
        </p>
        <p>Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
      </div>
    `,
  };
}

export function buildVerificationEmail(verificationUrl: string) {
  return {
    subject: 'Verifica tu correo en RDM Digital',
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#0f172a;max-width:560px;margin:auto">
        <h2 style="margin-bottom:8px">Verificación de correo</h2>
        <p>Para activar tu cuenta de <strong>RDM Digital</strong>, confirma tu correo con el siguiente botón:</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none">
            Verificar correo
          </a>
        </p>
        <p>Este enlace expira en 24 horas.</p>
      </div>
    `,
  };
}
