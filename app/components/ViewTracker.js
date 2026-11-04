"use client";

import { useEffect } from "react";

// 포트폴리오를 누가(보낸 링크 ?r=코드)·언제·얼마나 봤는지 기록해요. 관리자 본인 방문은 빼요.
// 링크로 들어오면 그 코드를 이 브라우저에 기억해 둬서, 나중에 그냥 다시 들어와도 같은 사람으로 기록돼요.
export const OWNER_KEY = "portfolio_owner";

function store(get, key, val) {
  try {
    if (get) return window.localStorage.getItem(key);
    window.localStorage.setItem(key, val);
  } catch { return null; }
  return null;
}

export default function ViewTracker() {
  useEffect(() => {
    if (store(true, OWNER_KEY)) return;
    let visitor = store(true, "pv_visitor");
    if (!visitor) {
      visitor = (crypto.randomUUID?.() || String(Math.random()).slice(2) + Date.now()).replace(/-/g, "");
      store(false, "pv_visitor", visitor);
    }
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("r");
    if (fromUrl) {
      store(false, "pv_link", fromUrl);
      // 주소창에서 ?r=코드는 지워서, 그 주소가 다른 사람에게 그대로 퍼지지 않게
      params.delete("r");
      const q = params.toString();
      window.history.replaceState(null, "", window.location.pathname + (q ? `?${q}` : "") + window.location.hash);
    }
    const link = fromUrl || store(true, "pv_link");
    let referrer = "";
    try { referrer = document.referrer && new URL(document.referrer).host !== window.location.host ? document.referrer : ""; } catch { /* ignore */ }

    const started = Date.now();
    let visible = 0;
    let lastShown = document.visibilityState === "visible" ? Date.now() : null;
    let viewId = null;
    const seconds = () => Math.round((visible + (lastShown ? Date.now() - lastShown : 0)) / 1000);
    const send = (payload, beacon) => {
      const body = JSON.stringify({ visitor, ...payload });
      if (beacon && navigator.sendBeacon) navigator.sendBeacon("/api/view", new Blob([body], { type: "application/json" }));
      else return fetch("/api/view", { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).then((r) => r.json()).catch(() => null);
    };

    send({ type: "view", link, path: window.location.pathname, referrer })?.then((r) => { viewId = r?.id || null; });

    const ping = (beacon) => { if (viewId) send({ type: "ping", id: viewId, seconds: seconds() }, beacon); };
    const onVis = () => {
      if (document.visibilityState === "hidden") {
        if (lastShown) { visible += Date.now() - lastShown; lastShown = null; }
        ping(true);
      } else {
        lastShown = Date.now();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    const timer = setInterval(() => ping(false), 15000);
    return () => { document.removeEventListener("visibilitychange", onVis); clearInterval(timer); void started; };
  }, []);
  return null;
}
