import { Bebas_Neue, IBM_Plex_Sans_KR } from "next/font/google";
import "./globals.css";

const display = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const body = IBM_Plex_Sans_KR({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata = {
  title: "정성재 — Video PD",
  description: "영상 PD 정성재(시네)의 작업물과 사이드 프로젝트",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${display.variable} ${body.variable}`}>
        {children}
      </body>
    </html>
  );
}
