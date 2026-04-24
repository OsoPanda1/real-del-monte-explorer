import crypto from 'crypto';

interface NewsletterSubscriber {
  email: string;
  name?: string;
  source?: string;
}

interface ProviderResult {
  ok: boolean;
  provider: string;
  details?: string;
}

const DEFAULT_TIMEOUT_MS = 8_000;

const createAbortSignal = (timeoutMs: number) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
};

const parseName = (name?: string) => {
  if (!name?.trim()) {
    return { firstName: '', lastName: '' };
  }

  const [firstName, ...rest] = name.trim().split(/\s+/);
  return { firstName, lastName: rest.join(' ') };
};

async function subscribeMailchimp(subscriber: NewsletterSubscriber): Promise<ProviderResult> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !listId) {
    return { ok: false, provider: 'mailchimp', details: 'MAILCHIMP_API_KEY or MAILCHIMP_AUDIENCE_ID missing' };
  }

  const dc = apiKey.split('-')[1];
  if (!dc) {
    return { ok: false, provider: 'mailchimp', details: 'MAILCHIMP_API_KEY has invalid format' };
  }

  const { firstName, lastName } = parseName(subscriber.name);
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;
  const { signal, clear } = createAbortSignal(DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email_address: subscriber.email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
          SOURCE: subscriber.source || 'website',
        },
      }),
      signal,
    });

    if (response.ok || response.status === 400) {
      return { ok: true, provider: 'mailchimp' };
    }

    const body = await response.text();
    return { ok: false, provider: 'mailchimp', details: `${response.status}: ${body.slice(0, 180)}` };
  } catch (error) {
    return { ok: false, provider: 'mailchimp', details: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    clear();
  }
}

async function unsubscribeMailchimp(email: string): Promise<ProviderResult> {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!apiKey || !listId) {
    return { ok: false, provider: 'mailchimp', details: 'MAILCHIMP_API_KEY or MAILCHIMP_AUDIENCE_ID missing' };
  }

  const dc = apiKey.split('-')[1];
  if (!dc) {
    return { ok: false, provider: 'mailchimp', details: 'MAILCHIMP_API_KEY has invalid format' };
  }

  const hash = crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members/${hash}`;
  const { signal, clear } = createAbortSignal(DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'unsubscribed' }),
      signal,
    });

    if (response.ok || response.status === 404) {
      return { ok: true, provider: 'mailchimp' };
    }

    const body = await response.text();
    return { ok: false, provider: 'mailchimp', details: `${response.status}: ${body.slice(0, 180)}` };
  } catch (error) {
    return { ok: false, provider: 'mailchimp', details: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    clear();
  }
}

async function subscribeBrevo(subscriber: NewsletterSubscriber): Promise<ProviderResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    return { ok: false, provider: 'brevo', details: 'BREVO_API_KEY or BREVO_LIST_ID missing' };
  }

  const { firstName, lastName } = parseName(subscriber.name);
  const { signal, clear } = createAbortSignal(DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: subscriber.email,
        listIds: [Number(listId)],
        updateEnabled: true,
        attributes: {
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SOURCE: subscriber.source || 'website',
        },
      }),
      signal,
    });

    if (response.ok || response.status === 400) {
      return { ok: true, provider: 'brevo' };
    }

    const body = await response.text();
    return { ok: false, provider: 'brevo', details: `${response.status}: ${body.slice(0, 180)}` };
  } catch (error) {
    return { ok: false, provider: 'brevo', details: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    clear();
  }
}

async function unsubscribeBrevo(email: string): Promise<ProviderResult> {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  if (!apiKey || !listId) {
    return { ok: false, provider: 'brevo', details: 'BREVO_API_KEY or BREVO_LIST_ID missing' };
  }

  const { signal, clear } = createAbortSignal(DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}/unlinkList/${listId}`, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
      },
      signal,
    });

    if (response.ok || response.status === 404) {
      return { ok: true, provider: 'brevo' };
    }

    const body = await response.text();
    return { ok: false, provider: 'brevo', details: `${response.status}: ${body.slice(0, 180)}` };
  } catch (error) {
    return { ok: false, provider: 'brevo', details: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    clear();
  }
}

export async function subscribeToNewsletterProvider(subscriber: NewsletterSubscriber): Promise<ProviderResult[]> {
  const results = await Promise.allSettled([
    subscribeMailchimp(subscriber),
    subscribeBrevo(subscriber),
  ]);

  return results.map((result) =>
    result.status === 'fulfilled'
      ? result.value
      : { ok: false, provider: 'unknown', details: result.reason instanceof Error ? result.reason.message : 'Unknown error' },
  );
}

export async function unsubscribeFromNewsletterProvider(email: string): Promise<ProviderResult[]> {
  const results = await Promise.allSettled([
    unsubscribeMailchimp(email),
    unsubscribeBrevo(email),
  ]);

  return results.map((result) =>
    result.status === 'fulfilled'
      ? result.value
      : { ok: false, provider: 'unknown', details: result.reason instanceof Error ? result.reason.message : 'Unknown error' },
  );
}
