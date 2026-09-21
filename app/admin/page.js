"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import defaultContent from "../../lib/defaultContent";

function Field({ label, value, onChange, textarea, placeholder, type, rows }) {
  return (
    <label className="a-field">
      <span>{label}</span>
      {textarea ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows || 6}
        />
      ) : (
        <input
          type={type || "text"}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </label>
  );
}

function linesToArr(text) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function arrToLines(arr) {
  return (arr || []).join("\n");
}

function rowsFor(value, min = 4) {
  const lines = (value || "").split("\n").length;
  return Math.max(min, lines + 1);
}

const PRESET_ROLES = ["기획", "연출", "촬영", "편집", "출연", "조명", "음향"];

function ContributionEditor({ items, onChange }) {
  const list = items || [];
  const activeRoles = new Set(list.map((c) => c.role));

  function togglePreset(role) {
    if (activeRoles.has(role)) {
      onChange(list.filter((c) => c.role !== role));
    } else {
      onChange([...list, { role, percent: 100 }]);
    }
  }

  return (
    <div className="a-contrib">
      <span className="a-contrib-label">기여도 (역할별, 선택)</span>
      <div className="a-preset-row">
        {PRESET_ROLES.map((role) => (
          <button
            type="button"
            key={role}
            className={"a-preset" + (activeRoles.has(role) ? " active" : "")}
            onClick={() => togglePreset(role)}
          >
            {activeRoles.has(role) ? "− " : "+ "}
            {role}
          </button>
        ))}
      </div>
      {list.map((c, i) => (
        <div className="a-row a-row-contrib" key={i}>
          <input
            placeholder="역할 (직접 입력도 가능)"
            value={c.role}
            onChange={(e) => {
              const arr = [...list];
              arr[i] = { ...arr[i], role: e.target.value };
              onChange(arr);
            }}
          />
          <input
            type="number"
            placeholder="%"
            value={c.percent}
            onChange={(e) => {
              const arr = [...list];
              arr[i] = { ...arr[i], percent: e.target.value };
              onChange(arr);
            }}
          />
          <button
            className="a-del"
            type="button"
            onClick={() => onChange(list.filter((_, j) => j !== i))}
          >
            삭제
          </button>
        </div>
      ))}
      <button
        className="a-add"
        type="button"
        onClick={() => onChange([...list, { role: "", percent: 100 }])}
      >
        + 다른 역할 직접 추가
      </button>
    </div>
  );
}

function formatPeriod(startMonth, endMonth, ongoing) {
  if (!startMonth) return "";
  const [sy, sm] = startMonth.split("-").map(Number);
  const startText = `${sy}.${String(sm).padStart(2, "0")}`;

  if (ongoing) {
    return `${startText} — 진행중`;
  }
  if (!endMonth) return startText;

  const [ey, em] = endMonth.split("-").map(Number);
  const endText = `${ey}.${String(em).padStart(2, "0")}`;
  const months = (ey - sy) * 12 + (em - sm) + 1;
  let durText = "";
  if (months > 0) {
    if (months >= 12) {
      const y = Math.floor(months / 12);
      const m = months % 12;
      durText = m > 0 ? `${y}년 ${m}개월` : `${y}년`;
    } else {
      durText = `${months}개월`;
    }
  }
  return durText
    ? `${startText} — ${endText} (${durText})`
    : `${startText} — ${endText}`;
}

function PeriodPicker({ startMonth, endMonth, ongoing, onChange }) {
  return (
    <div className="a-period-picker">
      <label className="a-field">
        <span>시작월</span>
        <input
          type="month"
          value={startMonth || ""}
          onChange={(e) =>
            onChange({ startMonth: e.target.value, endMonth, ongoing })
          }
        />
      </label>
      <label className="a-field">
        <span>종료월</span>
        <input
          type="month"
          value={endMonth || ""}
          disabled={ongoing}
          onChange={(e) =>
            onChange({ startMonth, endMonth: e.target.value, ongoing })
          }
        />
      </label>
      <label className="a-ongoing">
        <input
          type="checkbox"
          checked={!!ongoing}
          onChange={(e) =>
            onChange({ startMonth, endMonth, ongoing: e.target.checked })
          }
        />
        진행중
      </label>
    </div>
  );
}

function formatYearMonth(ym) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return `${y}.${m}`;
}

function getYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2];
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
    }
  } catch {
    return null;
  }
  return null;
}

function VideoPreview({ url }) {
  const [title, setTitle] = useState(null);
  const id = getYouTubeId(url);

  useEffect(() => {
    setTitle(null);
    if (!id) return;
    let cancelled = false;
    fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data) setTitle(data.title);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url, id]);

  if (!id) return null;

  return (
    <div className="a-video-preview">
      <img src={`https://img.youtube.com/vi/${id}/mqdefault.jpg`} alt="" />
      <span>{title || "유튜브 영상 (제목 불러오는 중...)"}</span>
    </div>
  );
}

function moveItem(arr, index, dir) {
  const newIndex = index + dir;
  if (newIndex < 0 || newIndex >= arr.length) return arr;
  const copy = [...arr];
  [copy[index], copy[newIndex]] = [copy[newIndex], copy[index]];
  return copy;
}

function LoginGate({ onUnlock }) {
  const [pw, setPw] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setChecking(true);
    setError("");
    const { data, error: rpcError } = await supabase.rpc(
      "check_portfolio_password",
      { pw }
    );
    setChecking(false);
    if (rpcError) {
      setError("오류가 발생했습니다: " + rpcError.message);
      return;
    }
    if (data === true) {
      onUnlock(pw);
    } else {
      setError("비밀번호가 틀렸습니다.");
    }
  }

  return (
    <div className="admin-wrap admin-gate">
      <a href="/" className="a-back">
        ← 홈으로
      </a>
      <h1>관리자 로그인</h1>
      <form onSubmit={handleSubmit}>
        <Field
          label="비밀번호"
          value={pw}
          onChange={setPw}
          type="password"
          placeholder="비밀번호를 입력하세요"
        />
        <button className="a-save-btn" type="submit" disabled={checking}>
          {checking ? "확인 중..." : "입장"}
        </button>
        {error && <p className="a-status">❌ {error}</p>}
      </form>
    </div>
  );
}

const TABS = [
  { id: "hero", label: "히어로" },
  { id: "intro", label: "자기소개" },
  { id: "profile", label: "프로필 카드" },
  { id: "skills", label: "스킬" },
  { id: "career", label: "경력" },
  { id: "projects", label: "프로젝트" },
  { id: "videos", label: "포트폴리오" },
  { id: "awards", label: "수상" },
  { id: "certifications", label: "자격증" },
  { id: "education", label: "학력" },
  { id: "volunteer", label: "자원봉사" },
  { id: "aboutMe", label: "핵심역량" },
  { id: "coverLetter", label: "자기소개서" },
  { id: "contact", label: "연락처" },
  { id: "devProjects", label: "사이드 프로젝트" },
];

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [content, setContent] = useState(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");
  const [draggedVideoIndex, setDraggedVideoIndex] = useState(null);
  const [expandedVideos, setExpandedVideos] = useState({});

  async function handleUnlock(pw) {
    setPassword(pw);
    setLoading(true);
    const { data, error } = await supabase
      .from("portfolio_content")
      .select("data")
      .eq("id", true)
      .single();
    if (error || !data) {
      setContent(defaultContent);
    } else {
      setContent({ ...defaultContent, ...data.data });
    }
    setLoading(false);
    setUnlocked(true);
  }

  if (!unlocked) {
    return <LoginGate onUnlock={handleUnlock} />;
  }

  if (loading || !content) {
    return (
      <div className="admin-wrap">
        <p>불러오는 중...</p>
      </div>
    );
  }

  const c = content;

  const setPath = (updater) => setContent((prev) => updater({ ...prev }));

  async function handleSave() {
    if (!password) {
      setStatus("❗ 비밀번호를 입력해주세요.");
      return;
    }
    setStatus("저장 중...");
    const { data, error } = await supabase.rpc("update_portfolio_content", {
      new_data: content,
      pw: password,
    });
    if (error) {
      setStatus("❌ 오류: " + error.message);
      return;
    }
    if (data === true) {
      setStatus("✅ 저장 완료! 사이트에 바로 반영됩니다.");
    } else {
      setStatus("❌ 비밀번호가 틀렸습니다.");
    }
  }

  const show = (id) => activeTab === id;

  return (
    <div className="admin-wrap admin-wrap--tabs">
      <a href="/" className="a-back">
        ← 홈으로
      </a>
      <h1>관리자 페이지</h1>
      <p className="admin-note">
        탭에서 섹션을 고른 뒤 수정하고, 화면 아래 저장 버튼으로 언제든
        저장하세요.
      </p>

      <div className="a-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={"a-tab" + (show(t.id) ? " active" : "")}
            onClick={() => setActiveTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="a-panel">
        {/* Hero */}
        {show("hero") && (
          <section className="a-section">
            <h2>히어로</h2>
            <Field
              label="역할 (예: VIDEO PD)"
              value={c.hero?.role}
              onChange={(v) => setPath((p) => ({ ...p, hero: { ...p.hero, role: v } }))}
            />
            <Field
              label="이름"
              value={c.hero?.name}
              onChange={(v) => setPath((p) => ({ ...p, hero: { ...p.hero, name: v } }))}
            />
            <Field
              label="한 줄 소개"
              value={c.hero?.tagline}
              onChange={(v) => setPath((p) => ({ ...p, hero: { ...p.hero, tagline: v } }))}
              textarea
            />
          </section>
        )}

        {/* Intro */}
        {show("intro") && (
          <section className="a-section">
            <h2>자기소개 본문</h2>
            <Field
              label="소개 문단"
              value={c.intro}
              onChange={(v) => setPath((p) => ({ ...p, intro: v }))}
              textarea
              rows={10}
            />
          </section>
        )}

        {/* Profile KV groups */}
        {show("profile") &&
          ["basic", "career", "contact"].map((key) => (
            <section className="a-section" key={key}>
              <h2>
                프로필 카드 —{" "}
                {key === "basic" ? "기본정보" : key === "career" ? "경력요약" : "연락처"}
              </h2>
              {key === "career" && (
                <p className="admin-note" style={{ marginBottom: 16 }}>
                  항목명이 "총 경력"이면, 값을 뭘 입력하든 경력 탭의 기간을
                  자동으로 합산한 값으로 사이트에 표시돼요.
                </p>
              )}
              {(c.profile?.[key] || []).map((row, i) => (
                <div className="a-row" key={i}>
                  <input
                    value={row.k}
                    placeholder="항목명 (예: 이름)"
                    onChange={(e) =>
                      setPath((p) => {
                        const arr = [...p.profile[key]];
                        arr[i] = { ...arr[i], k: e.target.value };
                        return { ...p, profile: { ...p.profile, [key]: arr } };
                      })
                    }
                  />
                  <input
                    value={row.v}
                    placeholder="값"
                    onChange={(e) =>
                      setPath((p) => {
                        const arr = [...p.profile[key]];
                        arr[i] = { ...arr[i], v: e.target.value };
                        return { ...p, profile: { ...p.profile, [key]: arr } };
                      })
                    }
                  />
                  <button
                    className="a-del"
                    onClick={() =>
                      setPath((p) => {
                        const arr = p.profile[key].filter((_, j) => j !== i);
                        return { ...p, profile: { ...p.profile, [key]: arr } };
                      })
                    }
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                className="a-add"
                onClick={() =>
                  setPath((p) => ({
                    ...p,
                    profile: {
                      ...p.profile,
                      [key]: [...(p.profile[key] || []), { k: "", v: "" }],
                    },
                  }))
                }
              >
                + 항목 추가
              </button>
            </section>
          ))}

        {/* Skill groups */}
        {show("skills") && (
          <section className="a-section">
            <h2>스킬</h2>
            {(c.skillGroups || []).map((g, i) => (
              <div className="a-card" key={i}>
                <Field
                  label="카테고리명"
                  value={g.label}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.skillGroups];
                      arr[i] = { ...arr[i], label: v };
                      return { ...p, skillGroups: arr };
                    })
                  }
                />
                <Field
                  label="스킬 목록 (한 줄에 하나씩)"
                  value={arrToLines(g.items)}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.skillGroups];
                      arr[i] = { ...arr[i], items: linesToArr(v) };
                      return { ...p, skillGroups: arr };
                    })
                  }
                  textarea
                  rows={rowsFor(arrToLines(g.items))}
                />
                <button
                  className="a-del"
                  onClick={() =>
                    setPath((p) => ({
                      ...p,
                      skillGroups: p.skillGroups.filter((_, j) => j !== i),
                    }))
                  }
                >
                  이 카테고리 삭제
                </button>
              </div>
            ))}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({
                  ...p,
                  skillGroups: [...(p.skillGroups || []), { label: "", items: [] }],
                }))
              }
            >
              + 스킬 카테고리 추가
            </button>
          </section>
        )}

        {/* Career */}
        {show("career") && (
          <section className="a-section">
            <h2>경력</h2>
            {(c.career || []).map((row, i) => (
              <div className="a-card" key={i}>
                <PeriodPicker
                  startMonth={row.startMonth}
                  endMonth={row.endMonth}
                  ongoing={row.ongoing}
                  onChange={({ startMonth, endMonth, ongoing }) =>
                    setPath((p) => {
                      const arr = [...p.career];
                      arr[i] = {
                        ...arr[i],
                        startMonth,
                        endMonth,
                        ongoing,
                        period: formatPeriod(startMonth, endMonth, ongoing),
                      };
                      return { ...p, career: arr };
                    })
                  }
                />
                <p className="a-period-preview">
                  표시될 기간: {row.period || "—"}
                </p>
                <Field
                  label="소속 · 직무"
                  value={row.org}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.career];
                      arr[i] = { ...arr[i], org: v };
                      return { ...p, career: arr };
                    })
                  }
                />
                <Field
                  label="담당 업무 (한 줄에 하나씩)"
                  value={arrToLines(row.bullets)}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.career];
                      arr[i] = { ...arr[i], bullets: linesToArr(v) };
                      return { ...p, career: arr };
                    })
                  }
                  textarea
                  rows={rowsFor(arrToLines(row.bullets))}
                />
                <ContributionEditor
                  items={row.contributions}
                  onChange={(arr) =>
                    setPath((p) => {
                      const a = [...p.career];
                      a[i] = { ...a[i], contributions: arr };
                      return { ...p, career: a };
                    })
                  }
                />
                <button
                  className="a-del"
                  onClick={() =>
                    setPath((p) => ({ ...p, career: p.career.filter((_, j) => j !== i) }))
                  }
                >
                  이 경력 삭제
                </button>
              </div>
            ))}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({
                  ...p,
                  career: [
                    ...(p.career || []),
                    {
                      period: "",
                      org: "",
                      bullets: [],
                      startMonth: "",
                      endMonth: "",
                      ongoing: false,
                    },
                  ],
                }))
              }
            >
              + 경력 추가
            </button>
          </section>
        )}

        {/* Projects */}
        {show("projects") && (
          <section className="a-section">
            <h2>프로젝트</h2>
            {(c.projects || []).map((row, i) => (
              <div className="a-card" key={i}>
                <PeriodPicker
                  startMonth={row.startMonth}
                  endMonth={row.endMonth}
                  ongoing={row.ongoing}
                  onChange={({ startMonth, endMonth, ongoing }) =>
                    setPath((p) => {
                      const arr = [...p.projects];
                      arr[i] = {
                        ...arr[i],
                        startMonth,
                        endMonth,
                        ongoing,
                        period: formatPeriod(startMonth, endMonth, ongoing),
                      };
                      return { ...p, projects: arr };
                    })
                  }
                />
                <p className="a-period-preview">
                  표시될 기간: {row.period || "—"}
                </p>
                <Field
                  label="프로젝트명"
                  value={row.title}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.projects];
                      arr[i] = { ...arr[i], title: v };
                      return { ...p, projects: arr };
                    })
                  }
                />
                <Field
                  label="내용 (한 줄에 하나씩)"
                  value={arrToLines(row.bullets)}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.projects];
                      arr[i] = { ...arr[i], bullets: linesToArr(v) };
                      return { ...p, projects: arr };
                    })
                  }
                  textarea
                  rows={rowsFor(arrToLines(row.bullets))}
                />
                <ContributionEditor
                  items={row.contributions}
                  onChange={(arr) =>
                    setPath((p) => {
                      const a = [...p.projects];
                      a[i] = { ...a[i], contributions: arr };
                      return { ...p, projects: a };
                    })
                  }
                />
                <button
                  className="a-del"
                  onClick={() =>
                    setPath((p) => ({
                      ...p,
                      projects: p.projects.filter((_, j) => j !== i),
                    }))
                  }
                >
                  이 프로젝트 삭제
                </button>
              </div>
            ))}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({
                  ...p,
                  projects: [
                    ...(p.projects || []),
                    {
                      period: "",
                      title: "",
                      bullets: [],
                      startMonth: "",
                      endMonth: "",
                      ongoing: false,
                    },
                  ],
                }))
              }
            >
              + 프로젝트 추가
            </button>
          </section>
        )}

        {/* Videos */}
        {show("videos") && (
          <section className="a-section">
            <h2>포트폴리오</h2>
            <p className="admin-note" style={{ marginBottom: 16 }}>
              유튜브 링크를 넣으면 페이지에서 바로 재생돼요. 다른 링크는 클릭시
              새 탭으로 열리는 카드로 표시돼요.
            </p>
            {(c.videos || []).map((row, i) => {
              const isOpen = !!expandedVideos[i];
              const ytId = getYouTubeId(row.url);
              return (
                <div
                  className={
                    "a-card a-draggable" +
                    (draggedVideoIndex === i ? " dragging" : "")
                  }
                  key={i}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedVideoIndex === null || draggedVideoIndex === i) {
                      setDraggedVideoIndex(null);
                      return;
                    }
                    setPath((p) => {
                      const arr = [...p.videos];
                      const [moved] = arr.splice(draggedVideoIndex, 1);
                      arr.splice(i, 0, moved);
                      return { ...p, videos: arr };
                    });
                    setDraggedVideoIndex(null);
                  }}
                >
                  <div
                    className="a-video-row"
                    onClick={() =>
                      setExpandedVideos((s) => ({ ...s, [i]: !s[i] }))
                    }
                  >
                    <div
                      className="a-drag-handle a-video-row-handle"
                      draggable
                      onClick={(e) => e.stopPropagation()}
                      onDragStart={() => setDraggedVideoIndex(i)}
                      onDragEnd={() => setDraggedVideoIndex(null)}
                      title="끌어서 순서 바꾸기"
                    >
                      ⠿
                    </div>
                    {ytId ? (
                      <img
                        className="a-video-row-thumb"
                        src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                        alt=""
                      />
                    ) : (
                      <div className="a-video-row-thumb a-video-row-thumb--empty">
                        {row.url ? "링크" : "비어있음"}
                      </div>
                    )}
                    <span className="a-video-row-title">
                      {row.title || row.url || "(제목 없음)"}
                    </span>
                    <span className="a-video-row-toggle">
                      {isOpen ? "▲ 접기" : "▼ 펼쳐서 수정"}
                    </span>
                  </div>

                  {isOpen && (
                    <div className="a-video-row-body">
                      <Field
                        label="제목"
                        value={row.title}
                        onChange={(v) =>
                          setPath((p) => {
                            const arr = [...p.videos];
                            arr[i] = { ...arr[i], title: v };
                            return { ...p, videos: arr };
                          })
                        }
                      />
                      <Field
                        label="링크(URL)"
                        value={row.url}
                        onChange={(v) =>
                          setPath((p) => {
                            const arr = [...p.videos];
                            arr[i] = { ...arr[i], url: v };
                            return { ...p, videos: arr };
                          })
                        }
                      />
                      <VideoPreview url={row.url} />
                      <ContributionEditor
                        items={row.contributions}
                        onChange={(arr) =>
                          setPath((p) => {
                            const a = [...p.videos];
                            a[i] = { ...a[i], contributions: arr };
                            return { ...p, videos: a };
                          })
                        }
                      />
                      <div className="a-reorder">
                        <button
                          type="button"
                          className="a-move"
                          disabled={i === 0}
                          onClick={() =>
                            setPath((p) => ({
                              ...p,
                              videos: moveItem(p.videos, i, -1),
                            }))
                          }
                        >
                          ▲ 위로
                        </button>
                        <button
                          type="button"
                          className="a-move"
                          disabled={i === (c.videos || []).length - 1}
                          onClick={() =>
                            setPath((p) => ({
                              ...p,
                              videos: moveItem(p.videos, i, 1),
                            }))
                          }
                        >
                          ▼ 아래로
                        </button>
                      </div>
                      <div className="a-reorder">
                        <button
                          type="button"
                          className="a-move"
                          onClick={() =>
                            setPath((p) => {
                              const arr = [...p.videos];
                              arr.splice(i, 0, {
                                title: "",
                                url: "",
                                contributions: [],
                              });
                              return { ...p, videos: arr };
                            })
                          }
                        >
                          + 이 위에 추가
                        </button>
                        <button
                          type="button"
                          className="a-move"
                          onClick={() =>
                            setPath((p) => {
                              const arr = [...p.videos];
                              arr.splice(i + 1, 0, {
                                title: "",
                                url: "",
                                contributions: [],
                              });
                              return { ...p, videos: arr };
                            })
                          }
                        >
                          + 이 아래에 추가
                        </button>
                      </div>
                      <button
                        className="a-del"
                        onClick={() =>
                          setPath((p) => ({
                            ...p,
                            videos: p.videos.filter((_, j) => j !== i),
                          }))
                        }
                      >
                        이 영상 삭제
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({ ...p, videos: [...(p.videos || []), { title: "", url: "" }] }))
              }
            >
              + 영상 추가
            </button>
          </section>
        )}

        {/* Awards */}
        {show("awards") && (
          <section className="a-section">
            <h2>수상</h2>
            {(c.awards || []).map((row, i) => (
              <div className="a-card" key={i}>
                <Field
                  label="수상명"
                  value={row.name}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.awards];
                      arr[i] = { ...arr[i], name: v };
                      return { ...p, awards: arr };
                    })
                  }
                />
                <Field
                  label="수여기관"
                  value={row.org}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.awards];
                      arr[i] = { ...arr[i], org: v };
                      return { ...p, awards: arr };
                    })
                  }
                />
                <label className="a-field">
                  <span>수상월</span>
                  <input
                    type="month"
                    value={row.yearMonth || ""}
                    onChange={(e) =>
                      setPath((p) => {
                        const arr = [...p.awards];
                        arr[i] = {
                          ...arr[i],
                          yearMonth: e.target.value,
                          year: formatYearMonth(e.target.value),
                        };
                        return { ...p, awards: arr };
                      })
                    }
                  />
                </label>
                <button
                  className="a-del"
                  onClick={() =>
                    setPath((p) => ({ ...p, awards: p.awards.filter((_, j) => j !== i) }))
                  }
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({
                  ...p,
                  awards: [
                    ...(p.awards || []),
                    { name: "", org: "", year: "", yearMonth: "" },
                  ],
                }))
              }
            >
              + 수상 추가
            </button>
          </section>
        )}

        {/* Certifications */}
        {show("certifications") && (
          <section className="a-section">
            <h2>자격증</h2>
            {(c.certifications || []).map((row, i) => (
              <div className="a-card" key={i}>
                <Field
                  label="자격명"
                  value={row.name}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.certifications];
                      arr[i] = { ...arr[i], name: v };
                      return { ...p, certifications: arr };
                    })
                  }
                />
                <Field
                  label="발급기관"
                  value={row.org}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.certifications];
                      arr[i] = { ...arr[i], org: v };
                      return { ...p, certifications: arr };
                    })
                  }
                />
                <label className="a-field">
                  <span>취득월</span>
                  <input
                    type="month"
                    value={row.yearMonth || ""}
                    onChange={(e) =>
                      setPath((p) => {
                        const arr = [...p.certifications];
                        arr[i] = {
                          ...arr[i],
                          yearMonth: e.target.value,
                          year: formatYearMonth(e.target.value),
                        };
                        return { ...p, certifications: arr };
                      })
                    }
                  />
                </label>
                <button
                  className="a-del"
                  onClick={() =>
                    setPath((p) => ({
                      ...p,
                      certifications: p.certifications.filter((_, j) => j !== i),
                    }))
                  }
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({
                  ...p,
                  certifications: [
                    ...(p.certifications || []),
                    { name: "", org: "", year: "", yearMonth: "" },
                  ],
                }))
              }
            >
              + 자격증 추가
            </button>
          </section>
        )}

        {/* Education */}
        {show("education") && (
          <section className="a-section">
            <h2>학력</h2>
            {(c.education || []).map((row, i) => (
              <div className="a-card" key={i}>
                <Field
                  label="학교"
                  value={row.school}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.education];
                      arr[i] = { ...arr[i], school: v };
                      return { ...p, education: arr };
                    })
                  }
                />
                <Field
                  label="전공"
                  value={row.major}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.education];
                      arr[i] = { ...arr[i], major: v };
                      return { ...p, education: arr };
                    })
                  }
                />
                <PeriodPicker
                  startMonth={row.startMonth}
                  endMonth={row.endMonth}
                  ongoing={row.ongoing}
                  onChange={({ startMonth, endMonth, ongoing }) =>
                    setPath((p) => {
                      const arr = [...p.education];
                      arr[i] = {
                        ...arr[i],
                        startMonth,
                        endMonth,
                        ongoing,
                        period: formatPeriod(startMonth, endMonth, ongoing),
                      };
                      return { ...p, education: arr };
                    })
                  }
                />
                <p className="a-period-preview">
                  표시될 기간: {row.period || "—"}
                </p>
                <Field
                  label="비고 (지역/학점/주야간 등, 선택)"
                  value={row.note}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.education];
                      arr[i] = { ...arr[i], note: v };
                      return { ...p, education: arr };
                    })
                  }
                />
                <button
                  className="a-del"
                  onClick={() =>
                    setPath((p) => ({
                      ...p,
                      education: p.education.filter((_, j) => j !== i),
                    }))
                  }
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({
                  ...p,
                  education: [
                    ...(p.education || []),
                    {
                      school: "",
                      major: "",
                      period: "",
                      note: "",
                      startMonth: "",
                      endMonth: "",
                      ongoing: false,
                    },
                  ],
                }))
              }
            >
              + 학력 추가
            </button>
          </section>
        )}

        {/* Volunteer */}
        {show("volunteer") && (
          <section className="a-section">
            <h2>자원봉사</h2>
            <div className="a-card">
              <p className="admin-note" style={{ marginBottom: 12 }}>
                누적 통계 (전체 활동 기간·시간·횟수) — 자원봉사 포털 확인서 등의
                총계를 넣으면 상단에 배지로 표시돼요. 비워두면 표시 안 됨.
              </p>
              <PeriodPicker
                startMonth={c.volunteerSummary?.startMonth}
                endMonth={c.volunteerSummary?.endMonth}
                ongoing={c.volunteerSummary?.ongoing}
                onChange={({ startMonth, endMonth, ongoing }) =>
                  setPath((p) => ({
                    ...p,
                    volunteerSummary: {
                      ...p.volunteerSummary,
                      startMonth,
                      endMonth,
                      ongoing,
                      period: formatPeriod(startMonth, endMonth, ongoing).replace(
                        /\s*\([^)]*\)\s*$/,
                        ""
                      ),
                    },
                  }))
                }
              />
              <p className="a-period-preview">
                표시될 기간: {c.volunteerSummary?.period || "—"}
              </p>
              <Field
                label="누적 시간 (예: 누적 1,273시간 27분)"
                value={c.volunteerSummary?.hours}
                onChange={(v) =>
                  setPath((p) => ({
                    ...p,
                    volunteerSummary: { ...p.volunteerSummary, hours: v },
                  }))
                }
              />
              <Field
                label="참여 횟수 (예: 총 249회 참여)"
                value={c.volunteerSummary?.count}
                onChange={(v) =>
                  setPath((p) => ({
                    ...p,
                    volunteerSummary: { ...p.volunteerSummary, count: v },
                  }))
                }
              />
            </div>
            {(c.volunteer || []).map((row, i) => (
              <div className="a-card" key={i}>
                <PeriodPicker
                  startMonth={row.startMonth}
                  endMonth={row.endMonth}
                  ongoing={row.ongoing}
                  onChange={({ startMonth, endMonth, ongoing }) =>
                    setPath((p) => {
                      const arr = [...p.volunteer];
                      arr[i] = {
                        ...arr[i],
                        startMonth,
                        endMonth,
                        ongoing,
                        period: formatPeriod(startMonth, endMonth, ongoing),
                      };
                      return { ...p, volunteer: arr };
                    })
                  }
                />
                <p className="a-period-preview">
                  표시될 기간: {row.period || "—"}
                </p>
                <Field
                  label="활동명"
                  value={row.title}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.volunteer];
                      arr[i] = { ...arr[i], title: v };
                      return { ...p, volunteer: arr };
                    })
                  }
                />
                <Field
                  label="내용 (한 줄에 하나씩)"
                  value={arrToLines(row.bullets)}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.volunteer];
                      arr[i] = { ...arr[i], bullets: linesToArr(v) };
                      return { ...p, volunteer: arr };
                    })
                  }
                  textarea
                  rows={rowsFor(arrToLines(row.bullets))}
                />
                <button
                  className="a-del"
                  onClick={() =>
                    setPath((p) => ({
                      ...p,
                      volunteer: p.volunteer.filter((_, j) => j !== i),
                    }))
                  }
                >
                  이 활동 삭제
                </button>
              </div>
            ))}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({
                  ...p,
                  volunteer: [
                    ...(p.volunteer || []),
                    {
                      period: "",
                      title: "",
                      bullets: [],
                      startMonth: "",
                      endMonth: "",
                      ongoing: false,
                    },
                  ],
                }))
              }
            >
              + 자원봉사 추가
            </button>
          </section>
        )}

        {/* About Me (핵심역량) */}
        {show("aboutMe") && (
          <section className="a-section">
            <h2>핵심역량</h2>
            <p className="admin-note" style={{ marginBottom: 16 }}>
              채용담당자가 빠르게 훑어볼 수 있는 핵심 요약이에요. 자기소개서
              바로 위에 표시돼요.
            </p>
            {(c.aboutMe || []).map((g, i) => (
              <div className="a-card" key={i}>
                <Field
                  label="블록 제목 (예: 핵심 역량, 일하는 방식)"
                  value={g.label}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.aboutMe];
                      arr[i] = { ...arr[i], label: v };
                      return { ...p, aboutMe: arr };
                    })
                  }
                />
                <Field
                  label="내용 (한 줄에 하나씩)"
                  value={arrToLines(g.items)}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.aboutMe];
                      arr[i] = { ...arr[i], items: linesToArr(v) };
                      return { ...p, aboutMe: arr };
                    })
                  }
                  textarea
                  rows={rowsFor(arrToLines(g.items))}
                />
                <button
                  className="a-del"
                  onClick={() =>
                    setPath((p) => ({
                      ...p,
                      aboutMe: p.aboutMe.filter((_, j) => j !== i),
                    }))
                  }
                >
                  이 블록 삭제
                </button>
              </div>
            ))}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({
                  ...p,
                  aboutMe: [...(p.aboutMe || []), { label: "", items: [] }],
                }))
              }
            >
              + 블록 추가
            </button>
          </section>
        )}

        {/* Cover letter */}
        {show("coverLetter") && (
          <section className="a-section">
            <h2>자기소개서</h2>
            {(c.coverLetter || []).map((row, i) => (
              <div className="a-card" key={i}>
                <Field
                  label="제목"
                  value={row.label}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.coverLetter];
                      arr[i] = { ...arr[i], label: v };
                      return { ...p, coverLetter: arr };
                    })
                  }
                />
                <Field
                  label="부제"
                  value={row.subtitle}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.coverLetter];
                      arr[i] = { ...arr[i], subtitle: v };
                      return { ...p, coverLetter: arr };
                    })
                  }
                />
                <Field
                  label="본문"
                  value={row.body}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.coverLetter];
                      arr[i] = { ...arr[i], body: v };
                      return { ...p, coverLetter: arr };
                    })
                  }
                  textarea
                  rows={Math.max(8, rowsFor(row.body || ""))}
                />
                <button
                  className="a-del"
                  onClick={() =>
                    setPath((p) => ({
                      ...p,
                      coverLetter: p.coverLetter.filter((_, j) => j !== i),
                    }))
                  }
                >
                  이 항목 삭제
                </button>
              </div>
            ))}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({
                  ...p,
                  coverLetter: [
                    ...(p.coverLetter || []),
                    { label: "", subtitle: "", body: "" },
                  ],
                }))
              }
            >
              + 자기소개서 항목 추가
            </button>
          </section>
        )}

        {/* Contact */}
        {show("contact") && (
          <section className="a-section">
            <h2>연락처</h2>
            <Field
              label="이메일"
              value={c.contact?.email}
              onChange={(v) => setPath((p) => ({ ...p, contact: { ...p.contact, email: v } }))}
            />
            <Field
              label="전화번호"
              value={c.contact?.phone}
              onChange={(v) => setPath((p) => ({ ...p, contact: { ...p.contact, phone: v } }))}
            />
            <Field
              label="포트폴리오 링크"
              value={c.contact?.portfolioUrl}
              onChange={(v) =>
                setPath((p) => ({ ...p, contact: { ...p.contact, portfolioUrl: v } }))
              }
            />
          </section>
        )}

        {/* Dev projects */}
        {show("devProjects") && (
          <section className="a-section">
            <h2>사이드 프로젝트 (개발)</h2>
            {(c.devProjects || []).map((row, i) => (
              <div className="a-card" key={i}>
                <Field
                  label="제목"
                  value={row.title}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.devProjects];
                      arr[i] = { ...arr[i], title: v };
                      return { ...p, devProjects: arr };
                    })
                  }
                />
                <Field
                  label="설명"
                  value={row.desc}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.devProjects];
                      arr[i] = { ...arr[i], desc: v };
                      return { ...p, devProjects: arr };
                    })
                  }
                  textarea
                  rows={4}
                />
                <Field
                  label="관련 홈페이지 URL (선택)"
                  value={row.url}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.devProjects];
                      arr[i] = { ...arr[i], url: v };
                      return { ...p, devProjects: arr };
                    })
                  }
                  placeholder="https://..."
                />
                <Field
                  label="기술 태그 (한 줄에 하나씩)"
                  value={arrToLines(row.tags)}
                  onChange={(v) =>
                    setPath((p) => {
                      const arr = [...p.devProjects];
                      arr[i] = { ...arr[i], tags: linesToArr(v) };
                      return { ...p, devProjects: arr };
                    })
                  }
                  textarea
                  rows={rowsFor(arrToLines(row.tags), 3)}
                />
                <button
                  className="a-del"
                  onClick={() =>
                    setPath((p) => ({
                      ...p,
                      devProjects: p.devProjects.filter((_, j) => j !== i),
                    }))
                  }
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              className="a-add"
              onClick={() =>
                setPath((p) => ({
                  ...p,
                  devProjects: [
                    ...(p.devProjects || []),
                    { title: "", desc: "", tags: [], url: "" },
                  ],
                }))
              }
            >
              + 사이드 프로젝트 추가
            </button>
          </section>
        )}
      </div>

      {/* Save — always visible regardless of tab */}
      <div className="a-save-bar">
        <button className="a-save-btn" onClick={handleSave}>
          저장하기
        </button>
        {status && <p className="a-status">{status}</p>}
      </div>
    </div>
  );
}
