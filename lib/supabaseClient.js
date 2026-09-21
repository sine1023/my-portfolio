import { createClient } from "@supabase/supabase-js";

// anon key는 공개되어도 안전한 키입니다 (RLS + Postgres 함수로 쓰기를 제한함).
const SUPABASE_URL = "https://rvelspdvmeuowxiwpoxc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2ZWxzcGR2bWV1b3d4aXdwb3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NjAwNjIsImV4cCI6MjEwNTUzNjA2Mn0.Yjt4689ORgyFzIZIeayMDVgK9EhR0r3RuuRM7cQ2K4Y";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
