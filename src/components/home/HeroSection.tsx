"use client";

import { useState } from "react";
import Img from "@/components/common/Img";
import Clerk from "@/components/home/Clerk";
import { banner } from "@/data/common/home";

/**
 * 인사 배너 — Figma 846:3505.
 *
 * 흰 카드(160) 위에 점원이 걸터앉고, 그 아래 진열대 선(25)이 이어진다.
 * 캐릭터는 카드 밖으로 나오지 않도록 카드에서 잘린다.
 *
 * 처음 온 사람에게는 점원이 옆의 문구를 소리 내어 말한다 — 입이 음절을 따라
 * 움직이고 그동안 눈을 깜빡인다. 두 번째부터는 하지 않는다. 늘 떠들면 문구를
 * 읽으려는 눈이 자꾸 옆으로 끌려간다.
 *
 * 그 인사가 3초 남짓이라 한눈팔면 지나가고, 지나가고 나면 눌러서 다시 볼 수
 * 있다는 것을 알 길이 없다. 그래서 점원 머리 위에 작은 안내를 붙인다. 한 번
 * 누르면 거둔다 — 할 일을 마친 안내가 남아 있으면 그때부터는 잔소리다.
 */
export default function HeroSection() {
  const [hint, setHint] = useState(true);

  return (
    <section className="mx-6 flex shrink-0 flex-col">
      <div className="relative h-[160px] w-full overflow-hidden rounded-t-lg border-x border-t border-[#ebf0f2] bg-white">
        {/*
          오른쪽 끝에서 잰다 — 프레임(402)에서는 왼쪽 223 이 곧 오른쪽 -23 이라
          같은 그림인데, 왼쪽에서 재면 좁은 폭에서 점원이 통째로 잘렸다(감수 지적).
          360 아래에서는 인사말과 겹치지 않게 조금 줄인다.
        */}
        <div className="absolute top-[30px] right-[-23px] origin-bottom-right max-[359px]:scale-75">
          <Clerk size={154} shadow greet onTap={() => setHint(false)} />
        </div>

        {/*
          안내는 점원 모자(y 30~67) 위 빈 자리에 앉힌다. 읽어 주지는 않는다 —
          점원 단추에 이미 「점원 인사 다시 보기」라는 이름이 붙어 있어서,
          같은 말을 두 번 듣게 된다.
        */}
        {hint ? (
          <span
            aria-hidden
            className="absolute top-[7px] right-[10px] rounded-full bg-gray-100 px-[9px] py-[3px] text-[11px] leading-[1.4] text-gray-600"
          >
            {banner.hint}
          </span>
        ) : null}

        {/* 점원이 기대선 상자 — 846:3520 */}
        <Img
          src="/assets/home/banner-box.svg"
          className="absolute top-[120px] left-[189px] h-[46px] w-[38px]"
        />

        <div className="absolute top-1/2 left-[19px] flex -translate-y-1/2 flex-col gap-[5px] whitespace-nowrap">
          <h2 className="text-xl leading-[1.3] font-semibold text-black">
            {banner.greeting.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="text-xs leading-[1.3] text-gray-600">{banner.sub}</p>
        </div>
      </div>

      {/* 진열대 — 846:3525 */}
      <Img src="/assets/home/banner-shelf.svg" className="h-[25px] w-full" />
    </section>
  );
}
