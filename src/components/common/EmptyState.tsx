import Img from "@/components/common/Img";

/**
 * 빈 상태 — Figma 1968:7144(기록 · 수첩) · 1968:7142(검색 · 돋보기 든 점원).
 *
 * 남는 세로를 다 받아(flex-1) 한가운데에 그림과 한 줄을 놓는다. 전에는 글 한 줄
 * 짜리 상자였는데, 막 가입한 사람(김민정)이 기록 · 검색에 들어오면 「없어요」 한
 * 줄뿐이라 허전했다 — 디자이너가 그린 그림을 화면 한가운데 둔다(사용자 요청).
 * 그림은 프레임 크기 그대로(90 × 98 · 95 × 100)고, 밑에 20 띄워 Gray/500 · 16 미디엄
 * 한 줄이다. 부모가 세로 flex 여야 가운데에 온다.
 */
export default function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div role="status" className="flex w-full flex-1 flex-col items-center justify-center gap-5">
      <Img src={icon} aria-hidden className="block" />
      <p className="text-center text-body-16 text-gray-500">{text}</p>
    </div>
  );
}
