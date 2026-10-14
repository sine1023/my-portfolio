"use server";

import { cookies } from "next/headers";
import {
  RESUME_COOKIE,
  RESUME_COOKIE_MAX_AGE,
  isAdminPassword,
} from "../../lib/resumeAccess";

// 비밀번호가 맞으면 이력서 페이지를 열 수 있는 쿠키를 심고 true를 돌려줍니다.
export async function unlockResume(pw) {
  const ok = await isAdminPassword(pw);
  if (!ok) return false;
  cookies().set(RESUME_COOKIE, pw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/resume",
    maxAge: RESUME_COOKIE_MAX_AGE,
  });
  return true;
}

export async function lockResume() {
  cookies().set(RESUME_COOKIE, "", { path: "/resume", maxAge: 0 });
}
