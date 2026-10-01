"use client";

import Link from "next/link";
import Img from "@/components/common/Img";
import RiseIn from "@/components/home/RiseIn";
import { fields } from "@/data/common/menu";
import { setCategoryChip } from "@/state/categoryChipStore";

/**
 * 분야 목록 — Figma 965:5950.
 *
 * 편의점 매대다(사용자 요청 — 회색 판이던 것을). 연한 초록 바탕 위에 흰 카드가
 * 한 장씩 초록 선반에 얹힌다. 선반은 홈 배너 밑 진열대(banner-shelf)와 같은
 * 초록(primary-600)에 앞턱만 한 단 어두운 700 — 그림을 새로 그리지 않고 색과
 * 판 두 장으로만 세운다. 선반이 카드보다 양옆으로 조금 더 나와야 카드가 판
 * 위에 「놓인」 것으로 보인다(카드 mx-2, 선반은 full).
 * 연한 초록은 이제 이 목록이 아니라 카테고리 화면 전체의 바탕이다(사용자 지시)
 * — 여기 있던 둥근 뒤판은 뺐다. 회색도 흰색도 아닌 까닭은 그대로다: 회색은 덜
 * 된 것으로 보였고, 흰색은 카드와 대비가 없었다(사용자 지적 둘). 브랜드 초록을
 * 옅게 푼 민트라 매대의 초록 선반과 한 결이고 흰 카드가 뜬다.
 * 왼쪽 네모는 분야색(토큰 500, Field.bg)으로 칠하고 그 위에 디자이너의 분야
 * 그림(시안 1968:6518)을 얹는다.
 * 누르면 그 분야의 지식 목록(/menu/category/<id>, 440:74)으로 간다 — 목록의
 * 칩은 주소를 안 보고 저장소(categoryChipStore)만 보므로, 누르는 순간 그 분야
 * 칩을 박아 둔다. 전에는 어느 분야를 눌러도 「전체」로 열렸다(사용자 지적).
 *
 * 카드는 위에서부터 차례로 떠오른다(RiseIn — 홈 섹션과 같은 것, 사용자 요청).
 */
export default function FieldList() {
  return (
    <ul className="mx-6 flex flex-col gap-4 px-3 pt-5 pb-4">
      {fields.map((field, i) => (
        <li key={field.id}>
          <RiseIn order={i}>
            {/* pr — 카드 안 오른쪽에 상품이 서는 자리. 글이 그 밑으로 못 들어가게 비워 둔다 */}
            <Link
              href={`/menu/category/${field.id}`}
              onClick={() => setCategoryChip(field.id)}
              /* 아래 모서리는 각지게 — 선반에 딱 얹히도록(사용자 지시). 위만 둥글다 */
              className="tap [--tap-w:0px] relative z-10 mx-2 flex items-center gap-3 rounded-t-lg bg-white p-3 pr-[56px] text-left shadow-[0_1px_2px_rgba(0,26,17,0.06)] transition-transform active:scale-[0.98]"
            >
              <span
                aria-hidden
                style={{ backgroundColor: field.bg }}
                className="flex size-[52px] shrink-0 items-center justify-center rounded-lg"
              >
                <Img src={field.icon} className="size-8 object-contain" />
              </span>
              <span className="flex min-w-px flex-1 flex-col gap-[6px]">
                <span className="text-base leading-[1.2] font-medium text-black">
                  {field.name}
                </span>
                <span className="truncate text-xs leading-[1.3] text-gray-500">
                  {field.sub}
                </span>
              </span>
              {/*
                상품 — 카드 안 오른쪽. 밑을 카드 바닥보다 4 내려 선반에 걸치되, 선반보다
                앞에 그려 가려지지 않는다(사용자 지시) — 선반 뒤가 아니라 선반 위에 놓인
                것으로 보인다. 카드(z-10)가 선반보다 앞이라 넘어온 자리도 같이 앞에 온다.
                홈 진열대 그림이라 결이 같다.
              */}
              {/*
                초콜릿(생활)만 그림 파일 안에서 19.41° 기울어져 그려져 있다 — 다른 넷은
                똑바로다. 다른 상품과 나란히 서게 그만큼 되돌린다(사용자 지시). 축은
                바닥 가운데라 선반에 선 자리는 그대로다.
              */}
              <Img
                src={field.product}
                aria-hidden
                className={`pointer-events-none absolute right-2.5 -bottom-1 h-[46px] w-auto ${
                  field.id === "life" ? "origin-bottom -rotate-[19.41deg]" : ""
                }`}
              />
            </Link>
            {/*
              선반 — 윗면(600)과 앞턱(700). 카드 바로 밑에 붙어 카드가 얹힌 것으로 보인다.
              위는 각지고 아래만 둥글다 — 카드 위 모서리와 같은 8 이라, 카드와 선반이
              위아래로 둥근 한 덩어리로 읽힌다(사용자 지시).
            */}
            <span
              aria-hidden
              className="relative h-[10px] w-full rounded-b-lg bg-primary-600 after:absolute after:inset-x-0 after:bottom-0 after:h-1 after:rounded-b-lg after:bg-primary-700 after:content-['']"
            />
          </RiseIn>
        </li>
      ))}
    </ul>
  );
}
