import Img from "@/components/common/Img";

/**
 * 지금 누가 치고 있다 — Figma 564:6286 의 «...» 자리.
 *
 * 그림(typing.svg)은 세 점의 진하기가 고정이라 멈춰 있는 «...» 으로 보인다.
 * 정말 치고 있는 것처럼 보이려면 점 하나가 차례로 살아나야 해서, 같은 생김새
 * (53x29 · 반지름 12 · #efefef 바탕에 5px 점 세 개)를 요소로 다시 그리고
 * 점마다 시작을 늦춰 파도를 만든다.
 *
 * 말풍선 자리는 다른 사람 말과 같다 — 아바타 34, 사이 9. 그림일 때는 26 이라
 * 점 세 개만 다른 줄에 서 있었다.
 *
 * 그 둘을 밖에서 바꿀 수 있게 열어 둔 것은 알래봇 때문이다. 거기는 얼굴이
 * 30, 사이가 10 이라 기본값 그대로 두면 점 세 개가 말풍선보다 3px 오른쪽에
 * 섰다가, 답이 오는 순간 왼쪽으로 미끄러진다.
 */
export default function TypingDots({
  avatar,
  size = 34,
  gap = 9,
}: {
  avatar: string;
  /** 얼굴 지름. */
  size?: number;
  /** 얼굴과 말풍선 사이. */
  gap?: number;
}) {
  return (
    <div className="flex w-full items-end" style={{ gap }}>
      <Img src={avatar} style={{ width: size, height: size }} className="shrink-0 rounded-full" />
      <span
        role="status"
        aria-label="상대방이 입력 중"
        className="flex h-[29px] w-[53px] shrink-0 items-center justify-center gap-[5px] rounded-[12px] rounded-bl-[4px] bg-[#efefef]"
      >
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            aria-hidden
            style={{ animationDelay: `${index * 160}ms` }}
            className="typing-dot size-[5px] rounded-full bg-[#bdbdc0]"
          />
        ))}
      </span>
    </div>
  );
}
