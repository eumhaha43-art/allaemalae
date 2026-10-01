import type { MetadataRoute } from "next";

/**
 * 홈 화면에 내려받을 때(PWA · 「홈 화면에 추가」) 쓰는 이름과 아이콘.
 *
 * 아이콘은 로고(로고.svg)를 그대로 그린 것 — 초록 바탕에 흰 봉투. 가로
 * 로고는 화면 안에서 쓰고, 이 정사각 것은 앱 아이콘과 파비콘에만 쓴다.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "알래말래븐 — 지식 편의점",
    short_name: "알래말래븐",
    description: "새로 들어온 따끈한 상식을 만나보세요!",
    start_url: "/",
    display: "standalone",
    background_color: "#028356",
    theme_color: "#028356",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
