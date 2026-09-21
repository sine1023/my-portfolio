// 실제 작품 정보가 정해지면 이 배열만 교체하면 됩니다.
const works = [
  { year: "2026", title: "[작품명을 입력하세요]", role: "연출" },
  { year: "2025", title: "[작품명을 입력하세요]", role: "PD" },
  { year: "2025", title: "[작품명을 입력하세요]", role: "편집" },
  { year: "2024", title: "[작품명을 입력하세요]", role: "연출" },
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

export default function Home() {
  return (
    <main>
      <div className="wrap">
        <section className="hero" style={{ paddingBottom: 0 }}>
          <p className="hero-role">Video PD</p>
          <h1 className="hero-name">정성재</h1>
          <p className="hero-tag">
            기획부터 연출, 편집까지 — 영상으로 이야기를 만드는 사람입니다.
            (시네)
          </p>
        </section>

        <section id="works">
          <div className="section-head">
            <h2>Works</h2>
            <span className="count">{works.length}편</span>
          </div>
          <ul className="works-list">
            {works.map((w, i) => (
              <li className="work-row" key={i}>
                <span className="year">{w.year}</span>
                <span className="title">
                  <span className="placeholder">{w.title}</span>
                </span>
                <span className="role">{w.role}</span>
              </li>
            ))}
          </ul>
          <p className="works-note">
            작품 정보는 준비 중입니다 — 제목/링크/스틸컷으로 곧 채워질
            자리입니다.
          </p>
        </section>

        <section id="about">
          <div className="section-head">
            <h2>About</h2>
          </div>
          <div className="about" style={{ marginTop: 32 }}>
            <div className="about-portrait">프로필 사진 자리</div>
            <div className="about-body">
              <p>
                자기소개 문구가 들어갈 자리입니다. 어떤 영상을 주로
                만드는지, 관심 있는 톤앤매너, 협업 경험 등을 자유롭게
                적어주세요.
              </p>
              <p className="muted">
                연락처: [이메일 또는 연락 수단을 입력하세요]
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="dev-section">
        <div className="wrap">
          <div className="section-head">
            <h2>Side Projects</h2>
            <span className="count">{devProjects.length}개</span>
          </div>
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
          <a href="mailto:example@email.com">Contact</a>
        </footer>
      </div>
    </main>
  );
}
