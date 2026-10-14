import {
  getContent,
  byRecency,
  calcTotalCareerMonths,
  formatTotalCareer,
} from "../../lib/content";
import { cookies } from "next/headers";
import { RESUME_COOKIE, isAdminPassword } from "../../lib/resumeAccess";
import ResumeToolbar from "./ResumeToolbar";
import ResumeLogin from "./ResumeLogin";
import "./resume.css";

export const revalidate = 0; // 관리자 페이지에서 고친 내용이 바로 반영되도록

async function hasAccess() {
  const pw = cookies().get(RESUME_COOKIE)?.value;
  return isAdminPassword(pw);
}

export async function generateMetadata() {
  if (!(await hasAccess())) {
    return { title: "이력서 — 관리자 전용", robots: { index: false } };
  }
  const content = await getContent();
  const name = content?.hero?.name || "이력서";
  // PDF로 저장할 때 이 제목이 기본 파일명이 됩니다.
  return {
    title: `${name}_이력서`,
    robots: { index: false },
  };
}

const SITE_URL = "https://jaedi.kr";

// 프로필 표에서 이미 머리말에 보여주는 항목은 빼고 나머지만 정보줄에 넣습니다.
const HIDDEN_INFO_KEYS = ["이름", "직군", "총 경력", "현재 상태"];

function Section({ ko, en, children, className = "" }) {
  return (
    <div className={`rs-sec ${className}`}>
      <div className="rs-sec-label">
        <h2>{ko}</h2>
        <span>{en}</span>
      </div>
      <div className="rs-sec-body">{children}</div>
    </div>
  );
}

function Entry({ title, period, bullets }) {
  return (
    <div className="rs-entry">
      <div className="rs-entry-head">
        <h3>{title}</h3>
        {period && <span className="rs-period">{period}</span>}
      </div>
      {bullets?.length > 0 && (
        <ul>
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function shortUrl(url) {
  return (url || "").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function contributionText(items) {
  return (items || [])
    .map((c) => `${c.role} ${Math.max(0, Math.min(100, Number(c.percent) || 0))}%`)
    .join(" · ");
}

export default async function ResumePage() {
  // 관리자 비밀번호 확인 전에는 이력서 내용을 아예 내려보내지 않습니다.
  if (!(await hasAccess())) {
    return <ResumeLogin />;
  }

  const content = await getContent();
  const {
    hero,
    intro,
    profile,
    skillGroups,
    career,
    projects,
    videos,
    awards,
    certifications,
    education,
    contact,
    devProjects,
    coverLetter,
    volunteer,
    volunteerSummary,
    aboutMe,
  } = content;

  const role =
    (profile?.basic || []).find((r) => r.k?.trim() === "직군")?.v || "Video PD";
  const totalCareerText = formatTotalCareer(calcTotalCareerMonths(career));
  const infoRows = [...(profile?.basic || []), ...(profile?.career || [])].filter(
    (r) => r.k && r.v && !HIDDEN_INFO_KEYS.includes(r.k.trim())
  );

  const sortedCareer = byRecency("period")(career);
  const sortedProjects = byRecency("period")(projects);
  const sortedAwards = byRecency("year")(awards);
  const sortedCertifications = byRecency("year")(certifications);
  const sortedEducation = byRecency("period")(education);
  const sortedVolunteer = byRecency("period")(volunteer);
  const strengths = aboutMe?.[0];
  const siteUrl = contact?.portfolioUrl || SITE_URL;

  return (
    <div className="rs-root">
      <ResumeToolbar hasCoverLetter={coverLetter?.length > 0} />

      <article className="rs-paper">
        <header className="rs-header">
          <div className="rs-id">
            <p className="rs-role">
              {role}
              {totalCareerText && <> · 경력 {totalCareerText}</>}
            </p>
            <h1>{hero?.name}</h1>
            {hero?.tagline && <p className="rs-tagline">{hero.tagline}</p>}
          </div>
          <ul className="rs-contact">
            {contact?.phone && <li>{contact.phone}</li>}
            {contact?.email && (
              <li>
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </li>
            )}
            <li>
              <a href={siteUrl}>{shortUrl(siteUrl)}</a>
            </li>
          </ul>
        </header>

        {infoRows.length > 0 && (
          <dl className="rs-info">
            {infoRows.map((r) => (
              <div key={r.k}>
                <dt>{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>
        )}

        {intro && (
          <Section ko="자기소개" en="Summary">
            <p className="rs-intro">{intro}</p>
          </Section>
        )}

        {sortedCareer.length > 0 && (
          <Section ko="경력" en="Career">
            {sortedCareer.map((c, i) => (
              <Entry key={i} title={c.org} period={c.period} bullets={c.bullets} />
            ))}
          </Section>
        )}

        {sortedProjects.length > 0 && (
          <Section ko="프로젝트" en="Projects">
            {sortedProjects.map((p, i) => (
              <Entry key={i} title={p.title} period={p.period} bullets={p.bullets} />
            ))}
          </Section>
        )}

        {strengths?.items?.length > 0 && (
          <Section ko="핵심역량" en="Strengths">
            <ul className="rs-plain-list">
              {strengths.items.map((it, i) => (
                <li key={i}>{it}</li>
              ))}
            </ul>
          </Section>
        )}

        {skillGroups?.length > 0 && (
          <Section ko="스킬" en="Skills">
            <table className="rs-table rs-skill-table">
              <tbody>
                {skillGroups.map((g) => (
                  <tr key={g.label}>
                    <th>{g.label}</th>
                    <td>{(g.items || []).join(" · ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {sortedEducation.length > 0 && (
          <Section ko="학력" en="Education">
            <table className="rs-table">
              <tbody>
                {sortedEducation.map((e, i) => (
                  <tr key={i}>
                    <td className="rs-td-period">{e.period}</td>
                    <td>
                      <strong>{e.school}</strong> {e.major}
                    </td>
                    <td className="rs-td-note">{e.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {(sortedAwards.length > 0 || sortedCertifications.length > 0) && (
          <Section ko="수상 · 자격" en="Awards & Licenses">
            <table className="rs-table">
              <tbody>
                {sortedAwards.map((a, i) => (
                  <tr key={`a${i}`}>
                    <td className="rs-td-period">{a.year}</td>
                    <td>
                      <span className="rs-tag">수상</span>
                      <strong>{a.name}</strong>
                    </td>
                    <td className="rs-td-note">{a.org}</td>
                  </tr>
                ))}
                {sortedCertifications.map((a, i) => (
                  <tr key={`c${i}`}>
                    <td className="rs-td-period">{a.year}</td>
                    <td>
                      <span className="rs-tag rs-tag-muted">자격</span>
                      {a.name}
                    </td>
                    <td className="rs-td-note">{a.org}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {videos?.length > 0 && (
          <Section ko="영상 포트폴리오" en="Portfolio">
            <p className="rs-note">
              전체 영상은 <a href={siteUrl}>{shortUrl(siteUrl)}</a>에서 바로 재생할 수
              있습니다.
            </p>
            <ol className="rs-video-list">
              {videos.map((v, i) => (
                <li key={i}>
                  <a href={v.url}>{v.title || shortUrl(v.url)}</a>
                  {v.contributions?.length > 0 && (
                    <span>{contributionText(v.contributions)}</span>
                  )}
                </li>
              ))}
            </ol>
          </Section>
        )}

        {devProjects?.length > 0 && (
          <Section ko="사이드 프로젝트" en="Side Projects">
            {devProjects.map((p) => (
              <div className="rs-entry rs-entry-compact" key={p.title}>
                <div className="rs-entry-head">
                  <h3>
                    {p.url ? <a href={p.url}>{p.title}</a> : p.title}
                  </h3>
                  {p.tags?.length > 0 && (
                    <span className="rs-period">{p.tags.join(" · ")}</span>
                  )}
                </div>
                <p>{p.desc}</p>
              </div>
            ))}
          </Section>
        )}

        {sortedVolunteer.length > 0 && (
          <Section ko="자원봉사" en="Volunteer">
            {volunteerSummary && (
              <p className="rs-note rs-stat">
                {[volunteerSummary.period, volunteerSummary.hours, volunteerSummary.count]
                  .filter(Boolean)
                  .join("  ·  ")}
              </p>
            )}
            <ul className="rs-volunteer">
              {sortedVolunteer.map((v, i) => (
                <li key={i}>
                  <span className="rs-period">{v.period}</span>
                  {v.title}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {coverLetter?.length > 0 && (
          <div className="rs-letter">
            <div className="rs-letter-head">
              <h2>자기소개서</h2>
              <span>{hero?.name}</span>
            </div>
            {coverLetter.map((entry, i) => (
              <div className="rs-letter-entry" key={i}>
                <h3>{entry.label}</h3>
                {entry.subtitle && <p className="rs-letter-sub">{entry.subtitle}</p>}
                {(entry.body || "")
                  .split(/\n+/)
                  .filter((para) => para.trim())
                  .map((para, j) => (
                    <p key={j}>{para}</p>
                  ))}
              </div>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}
