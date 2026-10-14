"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { lockResume } from "./actions";

// 화면에서만 보이는 상단 도구 막대 (인쇄/PDF에는 나오지 않음)
export default function ResumeToolbar({ hasCoverLetter }) {
  const router = useRouter();
  const [withLetter, setWithLetter] = useState(false);

  async function handleLock() {
    await lockResume();
    router.refresh();
  }

  useEffect(() => {
    // 주소에 ?letter=1 을 붙이면 자기소개서를 포함한 상태로 열립니다.
    const params = new URLSearchParams(window.location.search);
    if (params.get("letter") === "1") setWithLetter(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.letter = withLetter ? "on" : "off";
  }, [withLetter]);

  return (
    <div className="rs-toolbar">
      <div className="rs-toolbar-inner">
        <div className="rs-toolbar-left">
          <a href="/admin" className="rs-back">
            ← 관리자 페이지
          </a>
          <button type="button" className="rs-lock" onClick={handleLock}>
            잠그기
          </button>
        </div>
        <div className="rs-toolbar-actions">
          {hasCoverLetter && (
            <label className="rs-toggle">
              <input
                type="checkbox"
                checked={withLetter}
                onChange={(e) => setWithLetter(e.target.checked)}
              />
              자기소개서 포함
            </label>
          )}
          <button type="button" className="rs-print" onClick={() => window.print()}>
            PDF로 저장
          </button>
        </div>
      </div>
      <p className="rs-hint">
        인쇄 창에서 대상을 <b>PDF로 저장</b>으로 고르고, 설정의 <b>머리글과 바닥글</b>은
        끄고 <b>배경 그래픽</b>은 켜 주세요.
      </p>
    </div>
  );
}
