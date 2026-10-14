"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { unlockResume } from "./actions";

// 쿠키가 없거나 비밀번호가 바뀌었을 때 보이는 잠금 화면
export default function ResumeLogin() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setChecking(true);
    setError("");
    try {
      const ok = await unlockResume(pw);
      if (ok) {
        router.refresh();
        return;
      }
      setError("비밀번호가 틀렸습니다.");
    } catch {
      setError("확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    }
    setChecking(false);
  }

  return (
    <div className="admin-wrap admin-gate">
      <a href="/admin" className="a-back">
        ← 관리자 페이지
      </a>
      <h1>이력서 보기</h1>
      <p className="admin-note">관리자만 볼 수 있는 페이지입니다.</p>
      <form onSubmit={handleSubmit}>
        <label className="a-field">
          <span>비밀번호</span>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="관리자 비밀번호를 입력하세요"
            autoFocus
          />
        </label>
        <button className="a-save-btn" type="submit" disabled={checking}>
          {checking ? "확인 중..." : "입장"}
        </button>
        {error && <p className="a-status">❌ {error}</p>}
      </form>
    </div>
  );
}
