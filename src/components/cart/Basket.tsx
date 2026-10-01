/**
 * 냉장고 봉투 — Figma 2012:6870(디자이너가 새로 그린 것). 전에는 냉동실 문 · 손잡이가
 * 달린 회색 냉장고였다(기획 피드백으로 바구니에서 바꾼 것).
 *
 * 메인색(primary-600) 봉투 한 장이다 — 시안은 올리브 연두(Olive/200)였는데 메인색으로
 * 바꿨다(사용자 지시). 모양은 시안대로: 위 양 모서리에 귀가 서고 그
 * 사이가 파였으며 가운데에 손잡이 턱이 올라온다 — 시안의 Union 모양(406 × 556)을
 * 354 폭으로 줄인 자리(× 0.872)다. 귀 60 → 52, 파인 깊이 39 → 34, 턱 117 → 102 가
 * 26 → 23 에서. 안쪽 여백은 위 34 · 옆 18 · 아래 50.
 *
 * 봉투는 배경처럼 가만히 있고 카드만 그 안에서 넘겨진다(사용자 지시 — 봉투가 카드와
 * 같이 움직이면 안 된다). 그래서 봉투가 남는 세로를 다 받고(flex-1) 안쪽이 스크롤
 * 상자다 — 화면은 안 움직이고 봉투 속만 움직인다. 스크롤 상자는 여백 안쪽에 따로
 * 둔다 — 몸통 자체를 넘기게 했더니 카드가 봉투 윗선까지 올라와 잘린 것처럼 보였다
 * (사용자 지적). 여백 안쪽에서 잘리면 위 · 아래 테두리가 늘 초록으로 남아 봉투 속으로
 * 들어가는 것으로 읽힌다. 그림 파일이 아니라 네모 몇 개로 그린다 — 키가 화면 따라
 * 달라져서.
 *
 * 바닥은 시안의 젖빛 띠(2065:3825)다 — 봉투 맨 아래에 봉투 폭 그대로 40(× 0.872 = 35),
 * 봉투색 60% · 배경 흐림 4. 카드는 그 밑까지 내려가고 띠 너머로 흐릿하게 비친다. 전에
 * 있던 아래 여백 50 은 이 띠가 대신한다(디자이너 수정, 사용자 지시). 시안의 위쪽 띠
 * (2067:3826)는 넣지 않는다 — 위는 전처럼 여백 34 로 남긴다(사용자 결정). 스크롤 상자
 * 안쪽 아래에 띠 높이만큼 여백을 두어 끝까지 내리면 마지막 줄이 띠 위로 올라온다.
 * 누름은 통과한다.
 */
export default function Basket({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-[354px] flex-1 shrink-0 flex-col pt-[34px]">
      {/* 귀 둘 — 위 양 모서리 */}
      <span aria-hidden className="absolute top-0 left-0 h-[42px] w-[52px] rounded-t-[8px] bg-primary-600" />
      <span aria-hidden className="absolute top-0 right-0 h-[42px] w-[52px] rounded-t-[8px] bg-primary-600" />
      {/* 손잡이 턱 — 파인 자리 가운데 */}
      <span
        aria-hidden
        className="absolute top-[23px] left-1/2 h-[20px] w-[102px] -translate-x-1/2 rounded-t-[8px] bg-primary-600"
      />
      {/* 몸통 — 남는 세로를 다 받고, 여백 안쪽에서만 넘긴다(위 테두리는 늘 남고, 아래는 젖빛 띠) */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[8px] bg-primary-600 px-[18px] pt-[34px]">
        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[35px]">{children}</div>
        {/* 젖빛 띠 — 시안 2065:3825. 봉투 폭 그대로 바닥에 붙는다 */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[35px] bg-primary-600/60 backdrop-blur-[4px]"
        />
        {/*
          바닥 테두리 — 흐림(4)이 봉투 밖 흰 바탕까지 같이 빨아들여 맨 아랫줄이
          씻긴 것처럼 옅어졌다. 봉투 아래에 틈이 난 것으로 보인다(사용자 지적).
          흐림 반지름만큼(4) 봉투색으로 덮어 막는다 — 띠 모양은 그대로다.
        */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[4px] bg-primary-600"
        />
      </div>
    </div>
  );
}
