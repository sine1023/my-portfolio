// Supabase에서 데이터를 못 가져왔을 때 쓰는 기본값(placeholder)입니다.
const defaultContent = {
  hero: {
    role: "VIDEO PD",
    name: "정성재",
    tagline: "기획부터 연출, 편집까지 — 영상으로 이야기를 만드는 사람입니다. (시네)",
  },
  intro: "자기소개 문구가 들어갈 자리입니다.",
  profile: {
    basic: [{ k: "이름", v: "정성재" }],
    career: [{ k: "총 경력", v: "[입력 필요]" }],
    contact: [{ k: "Email", v: "example@email.com" }],
  },
  skillGroups: [],
  career: [],
  projects: [],
  videos: [],
  awards: [],
  education: [],
  contact: { email: "example@email.com", phone: "", portfolioUrl: "" },
  devProjects: [],
};

export default defaultContent;
