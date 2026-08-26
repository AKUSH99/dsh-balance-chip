/**
 * dsh-balance Host-Teil: fragt das DeepSeek-Guthaben über die offizielle
 * API ab (Key aus dem DSH-Credential-Speicher) und stellt es dem
 * Web-Client unter GET /dsh-balance bereit. Aktualisierung alle 60 s.
 */
export const name = 'dsh-balance-chip';

const state = { status: 'loading', balance: null, currency: 'USD', available: false, time: null };

async function fetchBalance(credentials) {
  try {
    if (credentials === undefined) {
      Object.assign(state, { status: 'no-key', time: new Date().toISOString() });
      return;
    }
    const key = await credentials.resolve('DEEPSEEK_API_KEY');
    if (!key) {
      Object.assign(state, { status: 'no-key', time: new Date().toISOString() });
      return;
    }
    const res = await fetch('https://api.deepseek.com/user/balance', {
      headers: { authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      Object.assign(state, { status: 'error', detail: 'HTTP ' + res.status, time: new Date().toISOString() });
      return;
    }
    const j = await res.json();
    if (j && j.balance_infos && j.balance_infos.length > 0) {
      const b = j.balance_infos[0];
      Object.assign(state, {
        status: 'ok',
        available: j.is_available !== false,
        balance: Number.parseFloat(b.total_balance) || 0,
        currency: b.currency || 'USD',
        time: new Date().toISOString(),
      });
    } else {
      Object.assign(state, {
        status: 'error',
        detail: (j && j.error && j.error.message) || 'unbekannte Antwort',
        time: new Date().toISOString(),
      });
    }
  } catch (error) {
    Object.assign(state, {
      status: 'error',
      detail: String((error && error.message) || error),
      time: new Date().toISOString(),
    });
  }
}

export function apply(ctx) {
  const credentials = ctx.get('credentials');
  const tick = () => { void fetchBalance(credentials); };
  tick();
  if (typeof ctx.setInterval === 'function') ctx.setInterval(tick, 60000);
  ctx.inject(['webServer'], (host) => {
    host.effect(() => host.webServer.register({
      kind: 'exact',
      path: '/dsh-balance',
      handler: (request, response) => {
        if (request.method !== 'GET') {
          response.writeHead(405, { allow: 'GET' });
          response.end();
          return;
        }
        response.writeHead(200, {
          'cache-control': 'no-store',
          'content-type': 'application/json; charset=utf-8',
        });
        response.end(JSON.stringify(state));
      },
    }), 'dsh-balance-chip: http route');
  });
}
