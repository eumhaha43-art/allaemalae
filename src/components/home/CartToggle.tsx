"use client";

import Img from "@/components/common/Img";
import { fridge } from "@/data/common/cart";
import { knowledgeIdFor } from "@/data/common/knowledge";
import { useCartEntry } from "@/hooks/useCartEntry";
import { putIntoCart, takeOutOfCart } from "@/state/cartFlightStore";
import { removeFromCart } from "@/state/cartStore";
import { toggleSave } from "@/state/reactionStore";

/**
 * 지식 장바구니 담기 단추.
 *
 * 누르면 초록으로 켜지고 다시 누르면 꺼진다. 담은 목록은 커뮤니티 게시글과
 * 같은 저장소를 쓰므로 새로고침해도 그대로 남는다 — SVG 는 CSS 로 색을 못
 * 바꿔서 초록 사본을 따로 둔다.
 *
 * 담을 때는 켜진 그림 한 장이 탭 바의 장바구니로 날아가고, 닿으면 탭 바
 * 배지가 하나 오른다(`cartFlightStore`) — 단추 색만 바뀌면 어디에 담겼는지가
 * 안 보인다. 빼면 배지가 바로 하나 내려간다.
 *
 * 켜짐은 제 이름이 아니라 **지식**으로 본다(useCartEntry). 같은 지식이 다른
 * 이름으로 담겨 있으면 켜져 있고, 끄면 그 이름으로 뺀다 — 점장님 Pick 의
 * 청바지를 담았으면 뽑기의 청바지도 켜져 있다. 장바구니에 처음부터 놓인
 * 지식(다 먹음 · 먹는 중)도 켜져 있고, 끄면 장바구니에서 빠진다 — 켜졌는데
 * 안 꺼지는 단추는 단추가 아니다(사용자 지적). 다시 켜면 새로 담은 것이라
 * 먹는 중 0% 로 들어간다.
 */
export default function CartToggle({
  id,
  off,
  on,
  className,
}: {
  /** 담은 항목을 구분하는 값. 게시글 id 와 겹치지 않게 접두사를 붙여 쓴다. */
  id: string;
  off: string;
  on: string;
  className: string;
}) {
  const { shelved, savedAs, inCart } = useCartEntry(knowledgeIdFor(id));

  return (
    <button
      type="button"
      aria-label={inCart ? fridge.take : fridge.put}
      aria-pressed={inCart}
      onClick={(event) => {
        if (shelved) {
          removeFromCart([knowledgeIdFor(id)]);
          return;
        }
        if (savedAs) {
          takeOutOfCart();
          toggleSave(savedAs);
          return;
        }
        putIntoCart(event.currentTarget);
        toggleSave(id);
      }}
      className="tap flex shrink-0"
    >
      <Img src={inCart ? on : off} className={className} />
    </button>
  );
}
