import type { Metadata, Viewport } from "next";
import { Pacifico } from "next/font/google";
import ShowcaseLayout from "@/layouts/ShowcaseLayout";
import "@/styles/globals.css";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
  display: "swap",
});

export const metadata: Metadata = {
  title: "알래말래븐 — 지식 편의점",
  description: "새로 들어온 따끈한 상식을 만나보세요!",
  // 홈 화면에 내려받을 때의 이름과 아이콘 — manifest.ts. 파비콘과 애플 아이콘은
  // 같은 폴더의 favicon.ico · icon.png · apple-icon.png 를 Next 가 알아서 단다.
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "알래말래븐", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 손가락 확대를 막지 않는다 — docs/01_구현_요구사항.md 3장.
  // maximumScale 을 1 로 묶으면 user-scalable=no 와 같은 효과가 난다.
  //
  // cover 는 화면 끝까지 그리게 하고, 노치·홈바 자리는 ShowcaseLayout 의
  // env(safe-area-inset-*) 여백이 비워 준다.
  viewportFit: "cover",
  // 상태바 · 주소창 색(theme-color)은 여기 적지 않는다 — 화면 맨 위 색에 맞춰
  // ShowcaseLayout 이 그린다. 여기 적어 두면 화면을 옮길 때 그 값으로 되돌아갔다.
};

/**
 * 영수증 글씨체(감자꽃 · 동해독도 · 펜글씨 · 연성)는 여기서 받지 않는다 —
 * public/fonts 에 서브셋을 두고 globals.css 의 @font-face 가 내주며, 영수증이
 * 있는 화면(Receipt)이 미리 받아 둔다. 전에는 구글 폰트 CSS 를 여기서 받았는데,
 * 한글이 조각으로 나뉘어 글꼴을 고르는 순간 글씨가 사라졌다 나타났다(감수 지적).
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${pacifico.variable} antialiased`}>
        {/*
          화면 틀은 ShowcaseLayout 이 하나로 관리한다 — PC 는 기기 목업 안,
          모바일은 목업 없이 실제 화면. 어느 쪽이든 앱은 402 x 874 기준이고
          가운데만 스크롤한다.
        */}
        <ShowcaseLayout>{children}</ShowcaseLayout>
      </body>
    </html>
  );
}
