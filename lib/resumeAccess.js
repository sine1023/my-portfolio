import { supabase } from "./supabaseClient";

// 이력서 페이지(/resume) 접근 권한 — 관리자 비밀번호로만 열립니다.
// 로그인하면 httpOnly 쿠키에 비밀번호를 담아 두고, 페이지를 열 때마다 서버에서 다시 확인합니다.
export const RESUME_COOKIE = "resume_access";
export const RESUME_COOKIE_MAX_AGE = 60 * 60 * 6; // 6시간

export async function isAdminPassword(pw) {
  if (!pw) return false;
  const { data, error } = await supabase.rpc("check_portfolio_password", { pw });
  return !error && data === true;
}
