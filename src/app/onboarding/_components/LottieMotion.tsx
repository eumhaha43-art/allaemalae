"use client";

import { useEffect, useRef } from "react";

/**
 * 움직이는 그림 한 장 — Lottie(JSON) 를 그려 준다.
 *
 * 디자이너가 After Effects 에서 뽑아 준 것이라 여기서 다시 그릴 수 없다.
 * 도형과 시간표만 든 JSON 이라 어느 크기로 늘려도 흐려지지 않고, 그림 파일
 * 대신 쓰면 무게도 훨씬 가볍다(온보딩 첫 장이 24KB).
 *
 * 부르는 쪽에서 넘겨받은 `.lottie` 묶음은 풀어서 안에 든 JSON 만 둔다 —
 * `.lottie` 는 zip 이라 브라우저에서 열려면 푸는 코드가 따로 필요하다.
 *
 * 그리는 일은 `lottie-web` 이 한다. 화면에 들어올 때 비로소 불러오므로
 * (동적 import) 온보딩을 지나간 뒤에는 이 짐을 지지 않는다. 셋 중 light
 * 판을 쓰는 것은 expressions(그림 안에 든 스크립트)를 빼서 가볍기 때문인데,
 * 받은 파일에 그것이 들어 있지 않은 것은 확인했다.
 *
 * 움직임을 줄여 달라고 해 둔 기기에서는 첫 칸만 세워 둔다. 아예 안 그리면
 * 화면 한가운데가 빈 자리가 되는데, 여기는 그림이 곧 내용인 화면이다.
 *
 * 다 돌면 `onDone` 을 부른다 — 본 것으로 칠 자리(`doneAt`)를 따로 주면 거기
 * 닿는 순간. 그것으로 「그림을 한 번 본 뒤에 열리는 단추」를 만드는데, 열쇠가
 * 하나뿐이면 그림이 안 도는 자리에서 단추가 영영 안 열린다. 그래서 못 도는
 * 경우마다 끝난 것으로 쳐 준다 — 움직임을 줄여 둔 기기, 그림을 못 받아 온
 * 경우, 그리고 어느 쪽도 아닌데 너무 오래 걸리는 경우(WAIT_MS).
 *
 * 뜻은 옆의 큰 글씨가 지고 있으므로 읽어 주지 않는다.
 */
/** 이만큼 기다려도 끝났다는 기별이 없으면 끝난 것으로 친다. 가장 긴 그림이 4.5초다. */
const WAIT_MS = 8000;

export default function LottieMotion({
  src,
  className,
  speed = 1,
  loop = true,
  hold,
  doneAt,
  onDone,
  onProgress,
}: {
  src: string;
  className?: string;
  /** 재생 속도 — 1 이 원본이다. 그림마다 체감이 달라 장마다 정한다. */
  speed?: number;
  /** 끝까지 가면 처음부터 다시 돌지. 여는 화면의 로고는 한 번만 돌고 멈춘다. */
  loop?: boolean;
  /**
   * 다 돌고 나서 세워 둘 자리 — 전체 길이의 몇 곱절(0~1). 안 주면 끝에 선다.
   *
   * 온보딩 그림은 한 바퀴 도는 것을 전제로 그려져 있다. 물건이 장바구니 안으로
   * 떨어져 들어가고, 영수증이 나왔다 다시 들어간다 — 그래서 **마지막 칸은 빈
   * 그림**이다. 한 번만 돌리고 멈추면 단추가 열리는 순간 화면이 텅 비어, 방금
   * 본 것이 없던 일이 된다.
   *
   * 그래서 끝까지 돌리지 않고, 그림이 가장 꽉 찬 자리까지만 돌린 뒤 거기 세운다.
   * 되감는 것이 아니라 처음부터 그 자리까지만 재생하므로 튀지 않는다.
   */
  hold?: number;
  /**
   * 본 것으로 칠 자리 — 전체 길이의 몇 곱절(0~1). 안 주면 다 돌았을 때다.
   *
   * 온보딩 그림은 다 들어온 뒤에도 잠깐 더 돈다 — 세워 둘 자리(`hold`)까지
   * 가만히 있거나(물건 · 영수증) 팔만 흔든다(말풍선). 그 끝까지 기다렸더니
   * 그림은 벌써 다 들어와 있는데 단추만 반 초쯤 늦게 열려 느리게 느껴졌다
   * (사용자 지적). 그래서 마지막 조각이 자리를 잡는 칸을 따로 받아, 거기 닿는
   * 순간 알린다. 그림은 그대로 세워 둘 자리까지 돈다.
   */
  doneAt?: number;
  /** 그림을 다 봤을 때(`doneAt`, 없으면 한 바퀴). 여러 번 불릴 수 있으니 받는 쪽에서 한 번만 치면 된다. */
  onDone?: () => void;
  /** 어디까지 봤는지(0~1) — 본 것으로 칠 자리(doneAt)까지를 1 로. 「다음」 단추의 진행 표시가 쓴다. */
  onProgress?: (ratio: number) => void;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = box.current;
    if (!host) return;

    // 치울 때 쓰는 것만 들고 있는다 — 나머지는 아래에서 받은 그대로 부른다
    let animation: { destroy: () => void } | null = null;
    /*
      불러오는 사이에 화면을 나갈 수 있다. 그때 그리기 시작하면 사라진 자리에
      붙는 셈이라, 늦게 도착한 것은 버린다.
    */
    let gone = false;

    const tell = () => {
      if (!gone) onDone?.();
    };

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // 안 도는 그림은 기다려 봐야 끝나지 않는다 — 세워 두는 순간 끝난 것으로 친다
    if (still) tell();
    const guard = window.setTimeout(tell, WAIT_MS);

    void import("lottie-web/build/player/lottie_light").then(({ default: lottie }) => {
      if (gone) return;
      const item = lottie.loadAnimation({
        container: host,
        renderer: "svg",
        loop,
        autoplay: !still,
        path: src,
      });
      // 원본이 정한 프레임 수는 그대로 두고 도는 빠르기만 바꾼다
      item.setSpeed(speed);

      /*
        프레임 수는 그림을 받아 온 뒤에야 알 수 있어서(`totalFrames`) 여기서
        바로 못 정하고, 다 읽혔다는 기별을 기다린다.
      */
      item.addEventListener("DOMLoaded", () => {
        // 아래서 구간을 자르면 `totalFrames` 가 잘린 길이로 바뀐다 — 원본 길이는 먼저 재 둔다
        const total = item.totalFrames;

        /*
          세워 둘 자리가 정해져 있으면 거기까지만 돌린다. 이미 0 번 칸에 서
          있으므로 같은 자리에서 다시 시작하는 셈이라 눈에는 아무 일도 일어나지
          않는다.
        */
        if (hold !== undefined && hold < 1) {
          const last = Math.max(1, Math.round(total * hold));
          item.playSegments([0, last], true);
        }

        // 본 것으로 칠 자리에 닿으면 바로 알린다 — 끝까지 도는 것은 기다리지 않는다
        const at = doneAt !== undefined && doneAt < 1 ? Math.round(total * doneAt) : total;
        let lastPercent = -1;
        const off = item.addEventListener("enterFrame", (frame) => {
          // 얼마나 봤는지 — 퍼센트가 바뀔 때만 알린다(프레임마다 다시 그리지 않게)
          const percent = Math.min(100, Math.floor((frame.currentTime / at) * 100));
          if (percent !== lastPercent) {
            lastPercent = percent;
            onProgress?.(percent / 100);
          }
          if (frame.currentTime < at) return;
          off();
          tell();
        });
      });

      item.addEventListener("complete", tell);
      // 그림을 못 받아 왔으면 볼 것이 없으니 기다릴 것도 없다
      item.addEventListener("data_failed", tell);
      animation = item;
    });

    return () => {
      gone = true;
      window.clearTimeout(guard);
      animation?.destroy();
      // destroy 가 남기고 가는 빈 <svg> 가 있어 자리가 접히지 않는다
      host.replaceChildren();
    };
  }, [src, speed, loop, hold, doneAt, onDone, onProgress]);

  return <div ref={box} aria-hidden className={className} />;
}
