"use client";

import { useEffect, useState } from "react";
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

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [content, setContent] = useState(null);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="admin-wrap">
      <a href="/" className="a-back">
        ← 홈으로
      </a>
      <h1>관리자 페이지</h1>
      <p className="admin-note">
        내용을 수정한 뒤 맨 아래에서 비밀번호를 입력하고 저장하세요. 저장하면
        바로 사이트에 반영됩니다.
      </p>

      {/* Hero */}
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

      {/* Intro */}
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

      {/* Profile KV groups */}
      {["basic", "career", "contact"].map((key) => (
        <section className="a-section" key={key}>
          <h2>
            프로필 카드 —{" "}
            {key === "basic" ? "기본정보" : key === "career" ? "경력요약" : "연락처"}
          </h2>
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

      {/* Career */}
      <section className="a-section">
        <h2>경력</h2>
        {(c.career || []).map((row, i) => (
          <div className="a-card" key={i}>
            <Field
              label="기간"
              value={row.period}
              onChange={(v) =>
                setPath((p) => {
                  const arr = [...p.career];
                  arr[i] = { ...arr[i], period: v };
                  return { ...p, career: arr };
                })
              }
            />
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
              career: [...(p.career || []), { period: "", org: "", bullets: [] }],
            }))
          }
        >
          + 경력 추가
        </button>
      </section>

      {/* Projects */}
      <section className="a-section">
        <h2>프로젝트</h2>
        {(c.projects || []).map((row, i) => (
          <div className="a-card" key={i}>
            <Field
              label="기간"
              value={row.period}
              onChange={(v) =>
                setPath((p) => {
                  const arr = [...p.projects];
                  arr[i] = { ...arr[i], period: v };
                  return { ...p, projects: arr };
                })
              }
            />
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
              projects: [...(p.projects || []), { period: "", title: "", bullets: [] }],
            }))
          }
        >
          + 프로젝트 추가
        </button>
      </section>

      {/* Videos */}
      <section className="a-section">
        <h2>영상</h2>
        <p className="admin-note" style={{ marginBottom: 16 }}>
          유튜브 링크를 넣으면 페이지에서 바로 재생돼요. 다른 링크는 클릭시
          새 탭으로 열리는 카드로 표시돼요.
        </p>
        {(c.videos || []).map((row, i) => (
          <div className="a-row" key={i}>
            <input
              value={row.title}
              placeholder="제목"
              onChange={(e) =>
                setPath((p) => {
                  const arr = [...p.videos];
                  arr[i] = { ...arr[i], title: e.target.value };
                  return { ...p, videos: arr };
                })
              }
            />
            <input
              value={row.url}
              placeholder="링크(URL)"
              onChange={(e) =>
                setPath((p) => {
                  const arr = [...p.videos];
                  arr[i] = { ...arr[i], url: e.target.value };
                  return { ...p, videos: arr };
                })
              }
            />
            <button
              className="a-del"
              onClick={() =>
                setPath((p) => ({ ...p, videos: p.videos.filter((_, j) => j !== i) }))
              }
            >
              삭제
            </button>
          </div>
        ))}
        <button
          className="a-add"
          onClick={() =>
            setPath((p) => ({ ...p, videos: [...(p.videos || []), { title: "", url: "" }] }))
          }
        >
          + 영상 추가
        </button>
      </section>

      {/* Awards */}
      <section className="a-section">
        <h2>수상</h2>
        {(c.awards || []).map((row, i) => (
          <div className="a-row a-row3" key={i}>
            <input
              value={row.name}
              placeholder="수상명"
              onChange={(e) =>
                setPath((p) => {
                  const arr = [...p.awards];
                  arr[i] = { ...arr[i], name: e.target.value };
                  return { ...p, awards: arr };
                })
              }
            />
            <input
              value={row.org}
              placeholder="수여기관"
              onChange={(e) =>
                setPath((p) => {
                  const arr = [...p.awards];
                  arr[i] = { ...arr[i], org: e.target.value };
                  return { ...p, awards: arr };
                })
              }
            />
            <input
              value={row.year}
              placeholder="연도"
              onChange={(e) =>
                setPath((p) => {
                  const arr = [...p.awards];
                  arr[i] = { ...arr[i], year: e.target.value };
                  return { ...p, awards: arr };
                })
              }
            />
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
              awards: [...(p.awards || []), { name: "", org: "", year: "" }],
            }))
          }
        >
          + 수상 추가
        </button>
      </section>

      {/* Education */}
      <section className="a-section">
        <h2>학력</h2>
        {(c.education || []).map((row, i) => (
          <div className="a-row a-row3" key={i}>
            <input
              value={row.school}
              placeholder="학교"
              onChange={(e) =>
                setPath((p) => {
                  const arr = [...p.education];
                  arr[i] = { ...arr[i], school: e.target.value };
                  return { ...p, education: arr };
                })
              }
            />
            <input
              value={row.major}
              placeholder="전공"
              onChange={(e) =>
                setPath((p) => {
                  const arr = [...p.education];
                  arr[i] = { ...arr[i], major: e.target.value };
                  return { ...p, education: arr };
                })
              }
            />
            <input
              value={row.period}
              placeholder="기간"
              onChange={(e) =>
                setPath((p) => {
                  const arr = [...p.education];
                  arr[i] = { ...arr[i], period: e.target.value };
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
              education: [...(p.education || []), { school: "", major: "", period: "" }],
            }))
          }
        >
          + 학력 추가
        </button>
      </section>

      {/* Contact */}
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

      {/* Dev projects */}
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
              devProjects: [...(p.devProjects || []), { title: "", desc: "", tags: [] }],
            }))
          }
        >
          + 사이드 프로젝트 추가
        </button>
      </section>

      {/* Save */}
      <section className="a-section a-save">
        <h2>저장</h2>
        <button className="a-save-btn" onClick={handleSave}>
          저장하기
        </button>
        {status && <p className="a-status">{status}</p>}
      </section>
    </div>
  );
}
