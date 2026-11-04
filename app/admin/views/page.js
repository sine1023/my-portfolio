"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

// 포트폴리오 열람 기록 (관리자 비밀번호로 열기)
//  - 누가: 회사·사람마다 "보낸 링크"(jaedi.kr/?r=코드)를 만들어 보내면, 그 링크로 들어온 방문에 이름이 붙어요.
//    링크 없이 들어온 방문은 "직접 방문"으로 나오고, 어디서 왔는지(유입 사이트)·위치·기기로 짐작할 수 있어요.
//  - 언제: 한국 시간, 어디서: 접속한 도시·나라(대략적인 위치), 얼마나: 화면을 보고 있던 시간
//  - 관리자로 로그인한 적 있는 브라우저(본인)는 기록하지 않아요.

const SITE = "https://jaedi.kr";
const COUNTRY = { KR: "한국", US: "미국", JP: "일본", CN: "중국", TW: "대만", HK: "홍콩", SG: "싱가포르", AU: "호주", CA: "캐나다", GB: "영국", DE: "독일", FR: "프랑스", VN: "베트남", TH: "태국", PH: "필리핀" };

function fmtTime(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric", weekday: "short", hour: "2-digit", minute: "2-digit" });
}
function fmtDur(s) {
  if (!s) return "-";
  if (s < 60) return `${s}초`;
  const m = Math.floor(s / 60);
  return m < 60 ? `${m}분 ${s % 60}초` : `${Math.floor(m / 60)}시간 ${m % 60}분`;
}
function refHost(r) {
  if (!r) return "";
  try { return new URL(r).host.replace(/^www\./, ""); } catch { return r; }
}
function place(v) {
  const c = v.country ? COUNTRY[v.country] || v.country : "";
  return [v.city, c].filter(Boolean).join(", ") || "알 수 없음";
}

const box = { background: "var(--card)", border: "1px solid var(--line)", borderRadius: 12, padding: 16 };
const btn = { fontFamily: "var(--font-body)", fontSize: 13, border: "1px solid var(--line)", background: "var(--card)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--ink)" };

export default function ViewsPage() {
  const [pw, setPw] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [err, setErr] = useState("");
  const [views, setViews] = useState([]);
  const [links, setLinks] = useState([]);
  const [days, setDays] = useState(30);
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  async function load(p = pw, d = days) {
    setLoading(true);
    const [v, l] = await Promise.all([
      supabase.rpc("get_portfolio_views", { pw: p, p_days: d }),
      supabase.rpc("list_portfolio_links", { pw: p }),
    ]);
    setLoading(false);
    if (v.error || l.error) { setErr("불러오지 못했어요. 비밀번호를 확인해 주세요."); setUnlocked(false); return; }
    setViews(v.data || []);
    setLinks(l.data || []);
  }

  async function unlock(e) {
    e.preventDefault();
    setErr("");
    const { data, error } = await supabase.rpc("check_portfolio_password", { pw });
    if (error) { setErr(error.message || "확인 중 오류가 났어요."); return; } // 여러 번 틀려서 잠긴 경우 등
    if (data !== true) { setErr("비밀번호가 틀렸습니다."); return; }
    try { window.localStorage.setItem("portfolio_owner", "1"); } catch {}
    setUnlocked(true);
    load(pw, days);
  }

  useEffect(() => {
    if (!unlocked) return;
    const t = setInterval(() => load(), 30000); // 30초마다 새로 고침
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked, days]);

  async function createLink(e) {
    e.preventDefault();
    if (!label.trim()) return;
    const { data, error } = await supabase.rpc("create_portfolio_link", { pw, p_label: label.trim() });
    if (error) { setErr("링크를 만들지 못했어요."); return; }
    setLabel("");
    await load();
    copy(`${SITE}/?r=${data}`, data);
  }
  async function removeLink(code, name) {
    if (!window.confirm(`"${name}" 링크를 지울까요? 지금까지의 기록은 남지만 이름 대신 "직접 방문"으로 보여요.`)) return;
    await supabase.rpc("delete_portfolio_link", { pw, p_code: code });
    load();
  }
  async function removeView(id) {
    await supabase.rpc("delete_portfolio_view", { pw, p_id: id });
    setViews((vs) => vs.filter((v) => v.id !== id));
  }
  async function copy(text, key) {
    try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(""), 1500); } catch {}
  }

  // 같은 브라우저(같은 사람)가 몇 번째로 본 건지
  const visitCount = useMemo(() => {
    const m = {};
    for (const v of views) m[v.visitor] = (m[v.visitor] || 0) + 1;
    return m;
  }, [views]);
  const shown = views.filter((v) => filter === "all" || (filter === "direct" ? !v.link_code : v.link_code === filter));
  const people = new Set(views.map((v) => v.visitor)).size;

  if (!unlocked) {
    return (
      <div className="admin-wrap admin-gate">
        <a href="/admin" className="a-back">← 관리자 페이지</a>
        <h1>열람 기록</h1>
        <p className="admin-note">누가·언제·어디서 포트폴리오를 봤는지 확인해요. 관리자 비밀번호가 필요해요.</p>
        <form onSubmit={unlock}>
          <label className="a-field">
            <span>비밀번호</span>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
          </label>
          <button className="a-save-btn" type="submit">열기</button>
          {err && <p className="a-status">❌ {err}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="admin-wrap" style={{ maxWidth: 1000 }}>
      <a href="/admin" className="a-back">← 관리자 페이지</a>
      <h1>열람 기록</h1>
      <p className="admin-note">
        회사·사람마다 <b>보낸 링크</b>를 만들어 보내면 누가 열었는지 이름으로 보여요. 위치는 접속한 곳의 대략적인 도시예요(통신사 위치라 실제와 다를 수 있어요).
        관리자로 로그인한 이 브라우저는 기록되지 않아요.
      </p>

      {/* 보낸 링크 */}
      <div style={{ ...box, marginTop: 20 }}>
        <h2 style={{ fontSize: 16, margin: "0 0 10px" }}>🔗 보낸 링크</h2>
        <form onSubmit={createLink} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="예: 스타쉽 영상팀 지원 (11/4)" maxLength={60}
            style={{ flex: "1 1 220px", padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 14 }} />
          <button type="submit" className="a-save-btn" style={{ margin: 0 }}>링크 만들기</button>
        </form>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "8px 0 12px" }}>만들면 주소가 바로 복사돼요. 지원서·메일에 이 주소를 넣어 보내세요.</p>
        {links.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0 }}>아직 만든 링크가 없어요.</p>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {links.map((l) => (
              <div key={l.code} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", borderTop: "1px solid var(--line)", paddingTop: 8 }}>
                <b style={{ fontSize: 14, flex: "1 1 180px" }}>{l.label}</b>
                <code style={{ fontSize: 12, color: "var(--muted)" }}>jaedi.kr/?r={l.code}</code>
                <span style={{ fontSize: 12, color: Number(l.views) ? "var(--accent)" : "var(--muted)", minWidth: 120 }}>
                  {Number(l.views) ? `${l.views}번 열람 · 마지막 ${fmtTime(l.last_view)}` : "아직 안 열었어요"}
                </span>
                <button type="button" style={btn} onClick={() => copy(`${SITE}/?r=${l.code}`, l.code)}>{copied === l.code ? "복사됨 ✓" : "주소 복사"}</button>
                <button type="button" style={btn} onClick={() => removeLink(l.code, l.label)}>지우기</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 요약 + 필터 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", margin: "24px 0 10px" }}>
        <h2 style={{ fontSize: 16, margin: 0, marginRight: "auto" }}>👀 열람 {views.length}번 · {people}명 {loading && <span style={{ fontSize: 12, color: "var(--muted)" }}>불러오는 중…</span>}</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={btn}>
          <option value="all">전체</option>
          <option value="direct">직접 방문</option>
          {links.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
        <select value={days} onChange={(e) => { const d = Number(e.target.value); setDays(d); load(pw, d); }} style={btn}>
          <option value={7}>최근 7일</option>
          <option value={30}>최근 30일</option>
          <option value={90}>최근 90일</option>
          <option value={365}>최근 1년</option>
        </select>
      </div>

      {shown.length === 0 ? (
        <div style={box}><p style={{ margin: 0, fontSize: 13, color: "var(--muted)" }}>이 기간에 열람 기록이 없어요.</p></div>
      ) : (
        <div style={{ display: "grid", gap: 8 }}>
          {shown.map((v) => (
            <div key={v.id} style={{ ...box, padding: "12px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 150px), 1fr))", gap: "6px 14px", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{v.link_label || "직접 방문"}</div>
                <div style={{ fontSize: 12, color: "var(--muted)" }}>{fmtTime(v.created_at)}{visitCount[v.visitor] > 1 ? ` · 이 사람 ${visitCount[v.visitor]}번째` : ""}</div>
              </div>
              <div style={{ fontSize: 13 }}>📍 {place(v)}</div>
              <div style={{ fontSize: 13 }}>{v.device === "휴대폰" ? "📱" : v.device === "태블릿" ? "📲" : "💻"} {v.device} · {v.browser} · {v.os}</div>
              <div style={{ fontSize: 13 }}>⏱ {fmtDur(v.seconds)}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={v.referrer || ""}>
                  {v.referrer ? `↪ ${refHost(v.referrer)}에서` : "↪ 주소 직접 입력·북마크"}
                </span>
                <button type="button" style={{ ...btn, fontSize: 11, padding: "3px 7px" }} onClick={() => removeView(v.id)} title="이 기록 지우기 (예: 내가 다른 기기로 본 것)">지우기</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
