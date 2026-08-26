window.__ModuleLoader__.load({ id: "dsh-balance-chip", factory: (require) => {

  var module = { exports: {} };
  var exports = module.exports;
  let react = require("react");

  const name = "dsh-balance-chip";

  function apply(ctx) {
    const slots = ctx.get("slots");
    if (slots === undefined) return;

    slots.inject("sidebar.footer.action", () => {
      const off = slots.register(
        { name: "sidebar.footer.action", id: "dsh-balance-chip" },
        (props) => {
          const [data, setData] = react.useState(null);

          react.useEffect(() => {
            let alive = true;
            async function tick() {
              try {
                const r = await fetch("/dsh-balance", { cache: "no-store" });
                if (!r.ok) throw new Error("HTTP " + r.status);
                const j = await r.json();
                if (alive) setData(j);
              } catch (e) {
                if (alive) setData({ status: "error", detail: String((e && e.message) || e) });
              }
            }
            tick();
            const t = setInterval(tick, 60000);
            return () => { alive = false; clearInterval(t); };
          }, []);

          const ok = data && data.status === "ok";
          const warn = ok && Number(data.balance) < 5;
          const color = !ok ? "#f87171" : (warn ? "#f59e0b" : "#34d399");
          const text = ok ? "$" + Number(data.balance).toFixed(2) : (data && data.status === "no-key" ? "Key?" : "…");
          const title = ok
            ? "DeepSeek Balance " + data.currency + " · aktualisiert " + new Date(data.time).toLocaleTimeString()
            : "DeepSeek Balance";

          return react.createElement(
            "div",
            {
              title: title,
              style: {
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                padding: props.wide ? "4px 8px" : "4px",
                borderRadius: "6px",
              },
            },
            react.createElement("span", {
              style: {
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: color,
                display: "inline-block",
                flexShrink: "0",
              },
            }),
            props.wide ? react.createElement("span", { style: { color: "#8b93a7" } }, text) : null
          );
        }
      );
      return off;
    });

    /* Always-visible pill bottom right (in-app overlay) */
    slots.inject("shell.overlay", () => {
      const off = slots.register(
        { name: "shell.overlay", id: "dsh-balance-chip-overlay", label: () => "DeepSeek Balance" },
        () => {
          const [data, setData] = react.useState(null);
          react.useEffect(() => {
            let alive = true;
            async function tick() {
              try {
                const r = await fetch("/dsh-balance", { cache: "no-store" });
                if (!r.ok) throw new Error("HTTP " + r.status);
                const j = await r.json();
                if (alive) setData(j);
              } catch (e) {
                if (alive) setData({ status: "error", detail: String((e && e.message) || e) });
              }
            }
            tick();
            const t = setInterval(tick, 60000);
            return () => { alive = false; clearInterval(t); };
          }, []);
          const ok = data && data.status === "ok";
          const warn = ok && Number(data.balance) < 5;
          const color = !ok ? "#f87171" : (warn ? "#f59e0b" : "#34d399");
          const text = ok ? "$" + Number(data.balance).toFixed(2) : (data && data.status === "no-key" ? "Key?" : "…");
          const title = ok
            ? "DeepSeek Balance " + data.currency + " · aktualisiert " + new Date(data.time).toLocaleTimeString()
            : "DeepSeek Balance";
          return react.createElement(
            "div",
            {
              title: title,
              style: {
                position: "fixed",
                bottom: "14px",
                right: "14px",
                zIndex: "2147483000",
                display: "flex",
                alignItems: "center",
                gap: "7px",
                padding: "6px 12px",
                borderRadius: "999px",
                background: "#0d1017",
                color: "#e6e9f2",
                fontSize: "13px",
                fontWeight: "700",
                boxShadow: "0 2px 10px rgba(0,0,0,.35)",
                pointerEvents: "none",
                fontFamily: "system-ui, 'Segoe UI', sans-serif",
              },
            },
            react.createElement("span", {
              style: { width: "8px", height: "8px", borderRadius: "50%", background: color, display: "inline-block", flexShrink: "0" },
            }),
            react.createElement("span", null, "Balance " + text)
          );
        }
      );
      return off;
    });
  }

  exports.apply = apply;
  exports.name = name;
  return module.exports;

}});
