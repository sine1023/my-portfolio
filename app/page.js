import { supabase } from "../lib/supabaseClient";
import defaultContent from "../lib/defaultContent";

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
  } = content;

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
                    {r.v}
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
              {career.map((c, i) => (
                <div className="timeline-row" key={i}>
                  <div className="period">{c.period}</div>
                  <div className="org">{c.org}</div>
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
            {projects.map((p, i) => (
              <div className="project-entry" key={i}>
                <div className="period">{p.period}</div>
                <h3>{p.title}</h3>
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
            <SectionHead ko="영상" en="Videos" />
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
                    </div>
                  );
                }
                return (
                  <a
                    className="video-slot"
                    href={v.url}
                    target="_blank"
                    rel="noreferrer"
                    key={i}
                  >
                    {v.title}
                  </a>
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
                {awards.map((a, i) => (
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
                {certifications.map((a, i) => (
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
                </tr>
              </thead>
              <tbody>
                {education.map((e, i) => (
                  <tr key={i}>
                    <td>{e.school}</td>
                    <td>{e.major}</td>
                    <td>{e.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        <div className="dev-section">
          <div className="wrap">
            <SectionHead ko="사이드 프로젝트" en="Side Projects" />
            <p className="dev-intro">
              영상 작업 외에, 팀을 운영하면서 필요했던 도구들을 직접 기획하고
              만들었습니다.
            </p>
            <div className="dev-grid">
              {devProjects.map((p) => (
                <div className="dev-card" key={p.title}>
                  <h3>{p.title}</h3>
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
