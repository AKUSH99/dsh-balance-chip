# dsh-balance-chip

Show your **DeepSeek API balance directly in the DSH sidebar footer**: a live status dot plus the amount, refreshed every 60 seconds.

- 🟢 green ≥ $5 · 🟠 orange < $5 · 🔴 red on errors
- Tooltip shows currency and last update time
- Collapsed sidebar (rail mode) shows just the dot
- **Your API key never ships with this plugin** – it is read at runtime from your local DSH credential store (`DEEPSEEK_API_KEY`), and the only network call goes to the official `api.deepseek.com/user/balance` endpoint from the host side.

## Install

```sh
dsh plugin --profile web add github:AKUSH99/dsh-balance-chip
```

Restart `dsh web` (or use the market's one-click restart), and the chip appears in the sidebar footer next to Settings.

Requires dsh web `0.1.0-rc.6` or newer (same base as the plugin market).

## How it works

| Part | What it does |
|---|---|
| `lib/index.js` (host) | Resolves the key via the `credentials` service, polls `GET https://api.deepseek.com/user/balance` every 60 s, serves the cached state at `GET /dsh-balance` |
| `client/client.js` (web) | Registers a `sidebar.footer.action` item that fetches `/dsh-balance` and renders the dot + amount |

No telemetry, no external dependencies, everything stays on your machine.

## 中文说明

在 DSH 侧边栏底部实时显示 DeepSeek API 余额：状态点 + 金额，每 60 秒自动刷新。余额低于 5 美元显示橙色，出错显示红色，悬停可见币种与更新时间。**API Key 绝不内置**：运行时从本机 DSH 凭证库读取，仅向官方余额接口发起请求。

## License

MIT
