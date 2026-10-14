import { supabase } from "./supabaseClient";
import defaultContent from "./defaultContent";

// 메인 페이지와 이력서 페이지가 같이 쓰는 데이터/계산 함수 모음

export async function getContent() {
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

function periodSortKey(str) {
  if (!str) return 0;
  if (/진행중|현재|present/i.test(str)) return 999999;
  const matches = str.match(/\d{4}(?:\.\d{1,2})?/g) || [];
  if (matches.length === 0) return 0;
  const last = matches[matches.length - 1];
  const [y, m] = last.split(".");
  return parseInt(y, 10) * 100 + (m ? parseInt(m, 10) : 0);
}

export function byRecency(field) {
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

export function calcTotalCareerMonths(career) {
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

export function formatTotalCareer(totalMonths) {
  if (totalMonths <= 0) return null;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years > 0 && months > 0) return `${years}년 ${months}개월`;
  if (years > 0) return `${years}년`;
  return `${months}개월`;
}
