// 실제 정보가 정해지면 아래 배열/객체만 교체하면 됩니다.

const profile = {
  basic: [
    { k: "이름", v: "정성재 (시네)" },
    { k: "직군", v: "Video PD" },
    { k: "활동지역", v: "[거주/활동 지역을 입력하세요]" },
  ],
  career: [
    { k: "총 경력", v: "[경력 기간을 입력하세요]" },
    { k: "소속", v: "[현재 소속/프리랜서 여부를 입력하세요]" },
    { k: "관심 분야", v: "[기획 / 연출 / 편집 등]" },
  ],
  contactCard: [
    { k: "Email", v: "example@email.com" },
    { k: "Instagram", v: "[아이디를 입력하세요]" },
  ],
};

const skillGroups = [
  { label: "기획·연출", items: ["[사용 방법론/툴 1]", "[사용 방법론/툴 2]"] },
  { label: "편집", items: ["[Premiere Pro 등]", "[DaVinci Resolve 등]"] },
  { label: "촬영", items: ["[사용 장비 1]", "[사용 장비 2]"] },
  { label: "협업 툴", items: ["Notion", "Slack"] },
];

const career = [
  {
    period: "[YYYY.MM — 진행중]",
    org: "[소속/팀명을 입력하세요]",
    bullets: ["[담당 업무 1]", "[담당 업무 2]"],
  },
  {
    period: "[YYYY.MM — YYYY.MM]",
    org: "[이전 소속/팀명을 입력하세요]",
    bullets: ["[담당 업무 1]"],
  },
];

const projects = [
  {
    period: "[YYYY.MM]",
    title: "[프로젝트/작품명을 입력하세요]",
    bullets: ["[역할 및 성과 1]", "[역할 및 성과 2]"],
  },
  {
    period: "[YYYY.MM]",
    title: "[프로젝트/작품명을 입력하세요]",
    bullets: ["[역할 및 성과 1]"],
  },
];

const videoCount = 4;

const awards = [
  { name: "[수상명을 입력하세요]", org: "[수여 기관]", year: "[연도]" },
];

const education = [
  { school: "[학교명을 입력하세요]", major: "[전공]", period: "[기간]" },
];

const devProjects = [
  {
    title: "팀 토리 스케쥴러",
    desc: "커버곡 제작팀의 곡 진행도·마감·게시판을 관리하는 웹사이트. 팀원 승인제 로그인, 역할별 게시판, 투표/설문, 실시간 알림까지 직접 기획하고 만들었습니다.",
    tags: ["Next.js", "Supabase", "Vercel"],
  },
  {
    title: "팀 토리 디스코드 봇",
    desc: "스케쥴러와 연동해 마감 알림, 곡·팀원 관리, 공지 알림을 디스코드에서 자동으로 처리하는 봇. NAS에 올려 24시간 상시 구동 중입니다.",
    tags: ["discord.js", "Node.js", "Docker"],
  },
  {
    title: "팀 토리 메신저",
    desc: "분야별·곡별 채팅방이 자동으로 생성되는 팀 전용 실시간 메신저. 읽음 표시, 파일 전송, 리액션까지 직접 설계했습니다.",
    tags: ["Next.js", "Supabase Realtime"],
  },
  {
    title: "카카오톡 오픈채팅 봇",
    desc: "개인적으로 운영하는 오픈채팅방을 위한 봇. 출석체크, 채팅 순위 등 커뮤니티 기능을 준비 중입니다.",
    tags: ["진행중"],
  },
];

function SectionHead({ ko, en }) {
  return (
    <div className="section-head">
      <h2>{ko}</h2>
      <p className="eng">{en}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <div className="wrap">
        <section className="hero" style={{ borderTop: "none" }}>
          <p className="hero-role">VIDEO PD</p>
          <h1 className="hero-name">정성재</h1>
          <p className="hero-tag">
            기획부터 연출, 편집까지 — 영상으로 이야기를 만드는 사람입니다.
            (시네)
          </p>
        </section>

        <section id="intro">
          <SectionHead ko="자기소개" en="Who am I" />
          <div className="intro-text">
            <p>
              자기소개 문구가 들어갈 자리입니다. 주로 다루는 영상의 톤앤매너,
              강점, 협업 스타일 등을 자유롭게 적어주세요.
            </p>
          </div>
          <div className="profile-grid" style={{ marginTop: 28 }}>
            <div className="profile-cell">
              <h3>기본정보</h3>
              <ul>
                {profile.basic.map((r) => (
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
                {profile.career.map((r) => (
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
                {profile.contactCard.map((r) => (
                  <li key={r.k}>
                    <span className="k">{r.k}</span>
                    {r.v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="skills">
          <SectionHead ko="스킬" en="Skills" />
          {skillGroups.map((g) => (
            <div className="skill-group" key={g.label}>
              <h4>{g.label}</h4>
              <div className="skill-tags">
                {g.items.map((it) => (
                  <span key={it}>{it}</span>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section id="career">
          <SectionHead ko="경력" en="Career" />
          <div className="timeline">
            {career.map((c, i) => (
              <div className="timeline-row" key={i}>
                <div className="period">{c.period}</div>
                <div className="org">{c.org}</div>
                <ul>
                  {c.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section id="projects">
          <SectionHead ko="프로젝트" en="Projects" />
          {projects.map((p, i) => (
            <div className="project-entry" key={i}>
              <div className="period">{p.period}</div>
              <h3>{p.title}</h3>
              <ul>
                {p.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section id="videos">
          <SectionHead ko="영상" en="Videos" />
          <div className="video-grid">
            {Array.from({ length: videoCount }).map((_, i) => (
              <div className="video-slot" key={i}>
                영상 링크 자리 {i + 1}
              </div>
            ))}
          </div>
          <p className="section-note">
            유튜브/비메오 링크나 임베드 코드로 교체할 자리입니다.
          </p>
        </section>

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

        <section id="contact">
          <SectionHead ko="연락처" en="Contact" />
          <div className="contact-row">
            <a href="mailto:example@email.com">example@email.com</a>
            <a href="#">Instagram</a>
          </div>
        </section>
      </div>

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
                  {p.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap">
        <footer>
          <span>&copy; {new Date().getFullYear()} 정성재</span>
        </footer>
      </div>
    </main>
  );
}
