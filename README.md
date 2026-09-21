# my-portfolio

정성재(시네)의 개인 포트폴리오 사이트. Next.js로 만들었습니다.

## 로컬에서 실행

```
npm install
npm run dev
```

http://localhost:3000 에서 확인할 수 있습니다.

## 내용 수정하기

- `app/page.js` — 작품 목록(`works`), 사이드 프로젝트(`devProjects`), 자기소개 문구
- `app/globals.css` — 색상/폰트/레이아웃

## 깃허브에 올리기 (Windows 명령 프롬프트)

압축을 푼 폴더로 이동한 뒤:

```
git init
git add .
git commit -m "포트폴리오 초기 버전"
git branch -M main
git remote add origin https://github.com/sine1023/my-portfolio.git
git push -u origin main
```
