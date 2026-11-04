import { headers } from "next/headers";
import { supabase } from "../../../lib/supabaseClient";

// 포트폴리오 열람 기록 — 브라우저(ViewTracker)가 보내면, 서버가 Vercel이 붙여주는 위치 정보(도시·나라)를 더해 저장해요.
// 검색엔진·링크 미리보기 봇은 기록하지 않아요.
const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|kakaotalk-scrap|Daum|Yeti|headless|lighthouse|vercel/i;

function parseUA(ua) {
  const device = /iPad|Tablet/i.test(ua) ? "태블릿" : /Mobi|Android|iPhone/i.test(ua) ? "휴대폰" : "PC";
  const os = /Windows/i.test(ua) ? "Windows" : /iPhone|iPad|iOS/i.test(ua) ? "iOS" : /Mac OS/i.test(ua) ? "macOS" : /Android/i.test(ua) ? "Android" : /Linux/i.test(ua) ? "Linux" : "기타";
  const browser = /KAKAOTALK/i.test(ua) ? "카카오톡" : /NAVER/i.test(ua) ? "네이버앱" : /Whale/i.test(ua) ? "웨일" : /Edg\//i.test(ua) ? "Edge" : /SamsungBrowser/i.test(ua) ? "삼성 인터넷" : /Chrome\//i.test(ua) ? "Chrome" : /Firefox\//i.test(ua) ? "Firefox" : /Safari\//i.test(ua) ? "Safari" : "기타";
  return { device, os, browser };
}

function maskIp(ip) {
  if (!ip) return null;
  if (ip.includes(".")) return ip.split(".").slice(0, 3).join(".") + ".*";
  return ip.split(":").slice(0, 3).join(":") + ":*";
}

const dec = (v) => { try { return v ? decodeURIComponent(v) : null; } catch { return v; } };

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch { return Response.json({ ok: false }, { status: 400 }); }
  const h = await headers();
  const ua = h.get("user-agent") || "";
  if (BOT_RE.test(ua)) return Response.json({ ok: true, skipped: true });

  const visitor = typeof body.visitor === "string" ? body.visitor.slice(0, 64) : "";

  if (body.type === "ping") {
    if (typeof body.id !== "string") return Response.json({ ok: false }, { status: 400 });
    await supabase.rpc("touch_portfolio_view", { p_id: body.id, p_visitor: visitor, p_seconds: Math.round(Number(body.seconds) || 0) });
    return Response.json({ ok: true });
  }

  const { device, os, browser } = parseUA(ua);
  const ip = (h.get("x-forwarded-for") || "").split(",")[0].trim();
  const { data } = await supabase.rpc("log_portfolio_view", {
    p_visitor: visitor,
    p_link: typeof body.link === "string" ? body.link.slice(0, 20) : null,
    p_path: typeof body.path === "string" ? body.path.slice(0, 200) : "/",
    p_city: dec(h.get("x-vercel-ip-city")),
    p_region: dec(h.get("x-vercel-ip-country-region")),
    p_country: h.get("x-vercel-ip-country"),
    p_device: device,
    p_browser: browser,
    p_os: os,
    p_referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 300) : null,
    p_ip: maskIp(ip),
  });
  return Response.json({ ok: true, id: data || null });
}
