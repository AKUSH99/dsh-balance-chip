/**
 * dsh-balance-chip Host-Teil: fragt das DeepSeek-Guthaben über die offizielle
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
    const resolved = await credentials.resolve('DEEPSEEK_API_KEY');
    const key = resolved && typeof resolved === 'object' ? resolved.value : resolved;
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

const inject = ['credentials', 'webServer'];

async function apply(ctx) {
  const tick = () => { void fetchBalance(ctx.credentials); };
  tick();
  const timer = setInterval(tick, 60000);
  await ctx.effect(() => {
    const disposeRoute = ctx.webServer.register({
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
    }, 'dsh-balance-chip: http route');
    return () => disposeRoute();
  });
}

export { apply, inject };
