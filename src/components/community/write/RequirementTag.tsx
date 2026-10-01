/**
 * 칸 이름 옆의 「필수 · 선택」 꼬리표.
 *
 * 없으면 등록이 안 되는 칸(카테고리 · 제목 · 본문)은 필수, 비워도 되는 칸
 * (사진 · 출처)은 선택이다. 바탕은 둘 다 회색이고 글자만 다르다 — 필수는
 * 메인색, 선택은 회색. 바탕까지 색을 주면 흰 카드 위에서 꼬리표가 튄다.
 */
export default function RequirementTag({ kind }: { kind: "필수" | "선택" }) {
  return (
    <span
      className={`rounded-[4px] px-[6px] py-[2.5px] text-[9.5px] leading-[1.4] font-bold tracking-[-0.19px] ${
        kind === "필수" ? "bg-gray-200 text-primary-600" : "bg-gray-200 text-gray-600"
      }`}
    >
      {kind}
    </span>
  );
}
