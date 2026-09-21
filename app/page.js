import { supabase } from "../lib/supabaseClient";
import defaultContent from "../lib/defaultContent";
import SectionNav from "./components/SectionNav";

export const revalidate = 0; // 항상 최신 데이터로

async function getContent() {
  const { data, error } = await supabase
    .from("portfolio_content")
    .select("data")
    .eq("id", true)
    .single();

  if (error || !data) {
    return defaultContent;
  }
  return { ...defaultContent, ...data.data };
}

const TOOL_ICON_SLUGS = {
  "adobe illustrator": "adobeillustrator",
  "adobe photoshop": "adobephotoshop",
  "adobe premiere": "adobepremierepro",
  "adobe premiere pro": "adobepremierepro",
  "adobe after effects": "adobeaftereffects",
  "adobe xd": "adobexd",
  "adobe indesign": "adobeindesign",
  "adobe lightroom": "adobelightroom",
  "adobe audition": "adobeaudition",
  "davinci resolve": "davinciresolve",
  "final cut pro": "finalcutpro",
  "figma": "figma",
  "notion": "notion",
  "slack": "slack",
};

function toolIconSlug(itemLabel) {
  const name = itemLabel.replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase();
  return TOOL_ICON_SLUGS[name] || null;
}

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id = null;
    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.slice(1);
    } else if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v");
      } else if (u.pathname.startsWith("/shorts/")) {
        id = u.pathname.split("/")[2];
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2];
      }
    }
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function ContributionList({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <span className="contribution-list">
      {items.map((c, i) => {
        const n = Math.max(0, Math.min(100, Number(c.percent) || 0));
        return (
          <span className="contribution-badge" key={i}>
            <span className="cb-bar">
              <span className="cb-fill" style={{ width: `${n}%` }} />
            </span>
            {c.role} {n}%
          </span>
        );
      })}
    </span>
  );
}

function periodSortKey(str) {
  if (!str) return 0;
  if (/진행중|현재|present/i.test(str)) return 999999;
  const matches = str.match(/\d{4}(?:\.\d{1,2})?/g) || [];
  if (matches.length === 0) return 0;
  const last = matches[matches.length - 1];
  const [y, m] = last.split(".");
  return parseInt(y, 10) * 100 + (m ? parseInt(m, 10) : 0);
}

function byRecency(field) {
  return (arr) =>
    [...(arr || [])].sort(
      (a, b) => periodSortKey(b[field]) - periodSortKey(a[field])
    );
}

function parseYearMonth(str) {
  if (!str) return null;
  const m = str.match(/(\d{4})\.(\d{1,2})/);
  if (!m) return null;
  return { y: parseInt(m[1], 10), m: parseInt(m[2], 10) };
}

function calcTotalCareerMonths(career) {
  let total = 0;
  for (const c of career || []) {
    const period = c.period || "";
    const matches = [...period.matchAll(/\d{4}\.\d{1,2}/g)].map((m) => m[0]);
    const start = matches[0] ? parseYearMonth(matches[0]) : null;
    if (!start) continue;

    let end;
    if (matches[1]) {
      end = parseYearMonth(matches[1]);
    } else if (/진행중|현재/i.test(period)) {
      const now = new Date();
      end = { y: now.getFullYear(), m: now.getMonth() + 1 };
    } else {
      continue; // 종료 시점을 알 수 없는 항목은 계산에서 제외
    }

    const months = (end.y - start.y) * 12 + (end.m - start.m) + 1;
    if (months > 0) total += months;
  }
  return total;
}

function formatTotalCareer(totalMonths) {
  if (totalMonths <= 0) return null;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years > 0 && months > 0) return `${years}년 ${months}개월`;
  if (years > 0) return `${years}년`;
  return `${months}개월`;
}

function SectionHead({ ko, en }) {
  return (
    <div className="section-head">
      <h2>{ko}</h2>
      <p className="eng">{en}</p>
    </div>
  );
}

export default async function Home() {
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
  } = content;

  const navItems = [
    { id: "intro", label: "자기소개", show: true },
    { id: "skills", label: "스킬", show: skillGroups?.length > 0 },
    { id: "career", label: "경력", show: career?.length > 0 },
    { id: "projects", label: "프로젝트", show: projects?.length > 0 },
    { id: "videos", label: "포트폴리오", show: videos?.length > 0 },
    { id: "awards", label: "수상", show: awards?.length > 0 },
    { id: "certifications", label: "자격증", show: certifications?.length > 0 },
    { id: "education", label: "학력", show: education?.length > 0 },
    { id: "volunteer", label: "자원봉사", show: volunteer?.length > 0 },
    { id: "cover-letter", label: "자기소개서", show: coverLetter?.length > 0 },
    { id: "contact", label: "연락처", show: true },
    { id: "dev-projects", label: "사이드 프로젝트", show: devProjects?.length > 0 },
  ].filter((n) => n.show);

  const sortedCareer = byRecency("period")(career);
  const sortedProjects = byRecency("period")(projects);
  const sortedAwards = byRecency("year")(awards);
  const sortedCertifications = byRecency("year")(certifications);
  const sortedEducation = byRecency("period")(education);
  const sortedVolunteer = byRecency("period")(volunteer);
  const totalCareerText = formatTotalCareer(calcTotalCareerMonths(career));

  return (
    <main>
      <a href="/admin" className="top-admin-link" aria-label="관리자 로그인">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </a>
      <div className="wrap">
        <section className="hero" style={{ borderTop: "none" }}>
          <p className="hero-role">{hero?.role}</p>
          <h1 className="hero-name">{hero?.name}</h1>
          <p className="hero-tag">{hero?.tagline}</p>
        </section>
      </div>

      <SectionNav items={navItems} />

      <div className="wrap">

        <section id="intro">
          <SectionHead ko="자기소개" en="Who am I" />
          <div className="intro-text">
            <p>{intro}</p>
          </div>
          <div className="profile-grid" style={{ marginTop: 28 }}>
            <div className="profile-cell">
              <h3>기본정보</h3>
              <ul>
                {(profile?.basic || []).map((r) => (
                  <li key={r.k}>
                    <span className="k">{r.k}</span>
                    {r.v}
                  </li>
                ))}
              </ul>
            </div>
            <div className="profile-cell">
              <h3>경력요약</h3>
              <ul>
                {(profile?.career || []).map((r) => (
                  <li key={r.k}>
                    <span className="k">{r.k}</span>
                    {r.k?.trim() === "총 경력" && totalCareerText
                      ? totalCareerText
                      : r.v}
                  </li>
                ))}
              </ul>
            </div>
            <div className="profile-cell">
              <h3>연락처</h3>
              <ul>
                {(profile?.contact || []).map((r) => (
                  <li key={r.k}>
                    <span className="k">{r.k}</span>
                    {r.v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {skillGroups?.length > 0 && (
          <section id="skills">
            <SectionHead ko="스킬" en="Skills" />
            {skillGroups.map((g) => (
              <div className="skill-group" key={g.label}>
                <h4>{g.label}</h4>
                <div className="skill-tags">
                  {g.items.map((it) => {
                    const slug = toolIconSlug(it);
                    return (
                      <span key={it}>
                        {slug && (
                          <img
                            className="skill-icon"
                            src={`https://cdnjs.cloudflare.com/ajax/libs/simple-icons/12.1.0/${slug}.svg`}
                            alt=""
                          />
                        )}
                        {it}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </section>
        )}

        {career?.length > 0 && (
          <section id="career">
            <SectionHead ko="경력" en="Career" />
            <div className="timeline">
              {sortedCareer.map((c, i) => (
                <div className="timeline-row" key={i}>
                  <div className="period">{c.period}</div>
                  <div className="org">
                    {c.org}
                  </div>
                  <ContributionList items={c.contributions} />
                  <ul>
                    {(c.bullets || []).map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {projects?.length > 0 && (
          <section id="projects">
            <SectionHead ko="프로젝트" en="Projects" />
            {sortedProjects.map((p, i) => (
              <div className="project-entry" key={i}>
                <div className="period">{p.period}</div>
                <h3>
                  {p.title}
                </h3>
                <ContributionList items={p.contributions} />
                <ul>
                  {(p.bullets || []).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {videos?.length > 0 && (
          <section id="videos">
            <SectionHead ko="포트폴리오" en="Portfolio" />
            <div className="video-grid">
              {videos.map((v, i) => {
                const embedUrl = getYouTubeEmbedUrl(v.url);
                if (embedUrl) {
                  return (
                    <div className="video-item" key={i}>
                      <div className="video-slot video-embed">
                        <iframe
                          src={embedUrl}
                          title={v.title || "video"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                      {v.title && <p className="video-caption">{v.title}</p>}
                      <ContributionList items={v.contributions} />
                    </div>
                  );
                }
                return (
                  <div className="video-item" key={i}>
                    <a
                      className="video-slot"
                      href={v.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {v.title}
                    </a>
                    <ContributionList items={v.contributions} />
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {awards?.length > 0 && (
          <section id="awards">
            <SectionHead ko="수상" en="Awards" />
            <table className="doc-table">
              <thead>
                <tr>
                  <th>수상명</th>
                  <th>수여기관</th>
                  <th>연도</th>
                </tr>
              </thead>
              <tbody>
                {sortedAwards.map((a, i) => (
                  <tr key={i}>
                    <td>{a.name}</td>
                    <td>{a.org}</td>
                    <td>{a.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {certifications?.length > 0 && (
          <section id="certifications">
            <SectionHead ko="자격증" en="Certifications" />
            <table className="doc-table">
              <thead>
                <tr>
                  <th>자격명</th>
                  <th>발급기관</th>
                  <th>취득일</th>
                </tr>
              </thead>
              <tbody>
                {sortedCertifications.map((a, i) => (
                  <tr key={i}>
                    <td>{a.name}</td>
                    <td>{a.org}</td>
                    <td>{a.year}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {education?.length > 0 && (
          <section id="education">
            <SectionHead ko="학력" en="Education" />
            <table className="doc-table">
              <thead>
                <tr>
                  <th>학교</th>
                  <th>전공</th>
                  <th>기간</th>
                  <th>비고</th>
                </tr>
              </thead>
              <tbody>
                {sortedEducation.map((e, i) => (
                  <tr key={i}>
                    <td>{e.school}</td>
                    <td>{e.major}</td>
                    <td>{e.period}</td>
                    <td>{e.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {volunteer?.length > 0 && (
          <section id="volunteer">
            <SectionHead ko="자원봉사" en="Volunteer" />
            {volunteerSummary && (
              <div className="stat-strip">
                {volunteerSummary.period && (
                  <span>{volunteerSummary.period}</span>
                )}
                {volunteerSummary.hours && (
                  <span>{volunteerSummary.hours}</span>
                )}
                {volunteerSummary.count && (
                  <span>{volunteerSummary.count}</span>
                )}
              </div>
            )}
            {sortedVolunteer.map((v, i) => (
              <div className="project-entry" key={i}>
                <div className="period">{v.period}</div>
                <h3>{v.title}</h3>
                <ul>
                  {(v.bullets || []).map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {coverLetter?.length > 0 && (
          <section id="cover-letter">
            <SectionHead ko="자기소개서" en="Cover Letter" />
            {coverLetter.map((entry, i) => (
              <div className="letter-entry" key={i}>
                <h3>{entry.label}</h3>
                {entry.subtitle && (
                  <p className="letter-subtitle">{entry.subtitle}</p>
                )}
                <p className="letter-body">{entry.body}</p>
              </div>
            ))}
          </section>
        )}

        <section id="contact">
          <SectionHead ko="연락처" en="Contact" />
          <div className="contact-row">
            {contact?.email && (
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
            )}
            {contact?.phone && <span>{contact.phone}</span>}
            {contact?.portfolioUrl && (
              <a href={contact.portfolioUrl} target="_blank" rel="noreferrer">
                포트폴리오 원본
              </a>
            )}
          </div>
        </section>
      </div>

      {devProjects?.length > 0 && (
        <div className="dev-section" id="dev-projects">
          <div className="wrap">
            <SectionHead ko="사이드 프로젝트" en="Side Projects" />
            <p className="dev-intro">
              영상 작업 외에, 팀을 운영하면서 필요했던 도구들을 직접 기획하고
              만들었습니다.
            </p>
            <div className="dev-grid">
              {devProjects.map((p) => (
                <div className="dev-card" key={p.title}>
                  <h3>
                    {p.url ? (
                      <a href={p.url} target="_blank" rel="noreferrer">
                        {p.title} ↗
                      </a>
                    ) : (
                      p.title
                    )}
                  </h3>
                  <p>{p.desc}</p>
                  <div className="tech-tags">
                    {(p.tags || []).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="wrap">
        <footer>
          <span>&copy; {new Date().getFullYear()} {hero?.name}</span>
        </footer>
      </div>
    </main>
  );
}
