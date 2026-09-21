import { Nanum_Myeongjo, IBM_Plex_Sans_KR, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Nanum_Myeongjo({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
});

const body = IBM_Plex_Sans_KR({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata = {
  metadataBase: new URL("https://my-portfolio-sine3.vercel.app"),
  title: "정성재 — Video PD",
  description:
    "기획부터 연출, 편집까지 — 현장과 후반작업을 모두 아우르는 PD, 정성재의 포트폴리오입니다.",
  openGraph: {
    title: "정성재 — Video PD",
    description:
      "기획부터 연출, 편집까지 — 현장과 후반작업을 모두 아우르는 PD, 정성재의 포트폴리오입니다.",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "정성재 — Video PD",
    description:
      "기획부터 연출, 편집까지 — 현장과 후반작업을 모두 아우르는 PD, 정성재의 포트폴리오입니다.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
