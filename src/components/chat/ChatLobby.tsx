"use client";

import { useState, useSyncExternalStore } from "react";
import Img from "@/components/common/Img";
import ActionFab from "@/components/common/ActionFab";
import PicnicTable from "@/components/chat/PicnicTable";
import RoomBubble from "@/components/chat/RoomBubble";
import RoomList from "@/components/chat/RoomList";
import SortMenu from "@/components/chat/SortMenu";
import ViewToggle from "@/components/common/ViewToggle";
import {
  rooms as builtIn,
  LAMP_HINT,
  hasTalk,
  seatCount,
  sortRooms,
  type Room,
  type SortId,
} from "@/data/common/chat";
import { getRoomsServerSnapshot, getRoomsSnapshot, subscribeRooms } from "@/state/roomStore";
import {
  getChatView,
  getChatViewServerSnapshot,
  getDaylight,
  getDaylightServerSnapshot,
  getLampTried,
  getLampTriedServerSnapshot,
  setChatView,
  subscribeChatView,
  toggleDaylight,
  type ChatView,
} from "@/state/chatViewStore";

/**
 * Chat lobby — Figma node 761:1026 ("채팅방 홈").
 *
 * The scene is a fixed 402 x 902 illustration with the rooms parked on top of
 * it as speech bubbles, so everything inside the dark panel keeps the exact
 * Figma coordinates rather than being re-flowed. The store, lamp and tables
 * are set dressing; the bubbles and the seated figures come from the rooms.
 *
 * The reset button walks through the pages below, which is how the lobby shows
 * a different pair of tables without a backend to ask.
 */
const VIEWS: [ChatView, string][] = [
  ["table", "테이블"],
  ["list", "목록"],
];

/**
 * 밤하늘의 별 — 가게 지붕 위 빈 하늘에 작고 옅게.
 *
 * 자리는 손으로 뿌렸다. 고르게 놓으면 격자로 보이고, 아무렇게나 뿌리면 그릴
 * 때마다 달라진다. 가로등 머리(46~120, 28~60)와 다른 방 보기 단추(346~390,
 * 10~54)는 비워 두었다. 크기 1.5~2.5, 밝기 0.3~0.6 — 더 크거나 밝으면 하늘이
 * 아니라 무늬가 된다. 저마다 다른 박자로 아주 약하게 깜빡인다(star-twinkle).
 */
const STARS: [number, number, number, number][] = [
  // [left, top, size, delay(s)]
  [24, 14, 2, 0],
  [58, 9, 1.5, 1.3],
  [96, 18, 2.5, 2.1],
  [134, 8, 1.5, 0.7],
  [160, 26, 2, 3.4],
  [188, 12, 1.5, 1.9],
  [214, 34, 2.5, 0.4],
  [246, 7, 2, 2.8],
  [270, 22, 1.5, 1.1],
  [302, 40, 2, 3.9],
  [326, 12, 1.5, 0.2],
  [352, 66, 2, 2.4],
  [378, 84, 1.5, 1.6],
  [20, 62, 1.5, 3.1],
  [140, 58, 1.5, 2.6],
  [236, 60, 2, 0.9],
];

function Stars() {
  return (
    <span aria-hidden className="absolute inset-0">
      {STARS.map(([left, top, size, delay]) => (
        <span
          key={`${left}-${top}`}
          className="star-twinkle absolute rounded-full bg-white"
          style={{ left, top, width: size, height: size, animationDelay: `${delay}s` }}
        />
      ))}
    </span>
  );
}

/**
 * 구름 — 둥근 덩어리 셋을 겹친 흰 띠. 그림 파일 없이 그린다.
 *
 * 폭만 받는다 — 높이는 폭의 0.36 이고, 덩어리들은 백분율로 앉아 있어 폭이
 * 달라도 같은 모양이다.
 */
function Cloud({ className }: { className: string }) {
  return (
    <span aria-hidden className={`${className} aspect-[100/36]`}>
      <span className="absolute bottom-0 left-0 h-[58%] w-full rounded-full bg-white/92" />
      <span className="absolute bottom-[18%] left-[18%] h-[82%] w-[42%] rounded-full bg-white/92" />
      <span className="absolute bottom-[14%] left-[48%] h-[64%] w-[34%] rounded-full bg-white/92" />
    </span>
  );
}

/**
 * 낮의 손님 — 옅은 회색 실루엣을 어둡게 눌러 하늘색 위에서 보이게 한다.
 * 0.62 보다 밝으면 하늘에 묻히고, 더 어두우면 테이블(갈색)보다 튄다.
 */
const GUEST_DAY = "[filter:brightness(0.62)]";

export default function ChatLobby() {
  const mine = useSyncExternalStore(subscribeRooms, getRoomsSnapshot, getRoomsServerSnapshot);
  // 화면 종류는 상태바·헤더·탭도 같이 보고 색을 고르므로 스토어에 둔다.
  const view = useSyncExternalStore(
    subscribeChatView,
    getChatView,
    getChatViewServerSnapshot,
  );
  const daylight = useSyncExternalStore(
    subscribeChatView,
    getDaylight,
    getDaylightServerSnapshot,
  );
  const [sort, setSort] = useState<SortId>("recent");
  const [set, setSet] = useState(0);
  const lampTried = useSyncExternalStore(subscribeChatView, getLampTried, getLampTriedServerSnapshot);
  // 가로등을 눌러 낮이 되면 테이블 장면도 크롬도 밝아진다
  const night = view === "table" && !daylight;
  const guestTone = daylight ? GUEST_DAY : "";

  // Rooms opened here sit among the built-in ones, and the chosen order decides
  // both the list and which two rooms share a page — the scene has two tables.
  // An odd tail leaves the far table empty rather than repeating a room.
  const all = sortRooms([...mine, ...builtIn], sort);
  const pages: Room[][] = [];
  for (let i = 0; i < all.length; i += 2) pages.push(all.slice(i, i + 2));

  // Creating a room grows `pages`, so the index has to wrap against it.
  const [near, far] = pages[set % pages.length];

  return (
    /*
      테이블 화면에서는 이 바탕도 하늘색이다. 탭 · 보기 줄 · 장면이 저마다
      하늘색을 칠해도, PC 목업의 축소(transform) 탓에 블록 사이에 1px 실금이
      생기는데 그 틈으로 이 바탕이 비친다 — 같은 색이면 안 보인다.
    */
    <main
      className={`flex w-full flex-1 flex-col ${
        view === "table" ? (daylight ? "bg-day" : "bg-night") : "bg-canvas"
      }`}
    >
      {/* 안내 — Figma 761:1065. The hint it used to hold is now the 테이블 tab. */}
      <div
        className={`flex w-full shrink-0 items-center px-5 py-[7px] ${
          night ? "bg-night" : daylight && view === "table" ? "bg-day" : "bg-white"
        }`}
      >
        <ViewToggle
          label="채팅방 보기 방식"
          options={VIEWS}
          value={view}
          onChange={setChatView}
          night={night}
        />
        <div className="flex-1" />
        <SortMenu sort={sort} onSort={setSort} night={night} />
      </div>

      {/*
        방 만들기 — 게시글의 글쓰기 버튼과 같은 동그란 버튼이고 아이콘만 + 다.
        장면이 아니라 화면에 붙어 있어서 테이블을 아무리 내려도 손에 닿고, 두
        화면에서 자리가 같다.
      */}
      <ActionFab href="/community/chat/new" label="방 만들기" icon="/assets/chat/plus.svg" />

      {/*
        761:2134 — 다른 방 보기. 테이블 화면에서만 쓴다(목록은 방을 다 편다).

        장면 안에 두고 sticky 로 따라오게 했더니 두 가지가 어긋났다. 다 내리면
        위쪽 고정 띠(헤더 60 + 탭 142) 뒤로 들어가 보이지도 눌리지도 않았고,
        그전까지는 장면을 따라 오르내렸다. 방을 바꿔 가며 보는 단추라 늘 같은
        자리에 있어야 한다.

        fixed 는 답이 아니다. PC 목업에서는 기준 상자가 기기 화면 전체라 위쪽
        상태바(9:41)까지 포함해, 같은 값이 모바일과 다른 높이에 앉는다.

        그래서 스크롤 상자 안에서 sticky 로 못 박는다. 높이 0 짜리 상자를 main
        의 맨 앞에 두면 제자리가 202(고정 띠 아래)인데, top 을 259 로 잡으면
        sticky 가 처음부터 그 자리로 밀어 놓고 스크롤 내내 붙잡아 둔다 — 오르
        내림 없이 한 자리다.

        259 = 헤더 60 + 탭 142(점원 상자) + 보기·정렬 줄 49 에 8 을 띄운 값이다. 그보다
        올리면 정렬 메뉴와 겹친다.
      */}
      {view === "table" ? (
        <div className="pointer-events-none sticky top-[259px] z-20 flex h-0 justify-end pr-[12px]">
          {/* 44px tap target centred on the icon the design puts at (368, 32) */}
          <button
            type="button"
            aria-label="다른 채팅방 보기"
            onClick={() => setSet((current) => (current + 1) % pages.length)}
            className="pointer-events-auto flex size-11 items-center justify-center"
          >
            <Img src="/assets/chat/reset.svg" className="size-6" />
          </button>
        </div>
      ) : null}

      {view === "list" ? (
        <RoomList rooms={all} />
      ) : (
      /*
        테이블 전경 — Figma 761:1074. The frame is 902 tall, but the far table
        bottoms out at 736 and a page with only a near table at 510, so the
        panel stops just below whichever is showing instead of trailing off
        into empty dark.

        The scene clips its own overflow, and `overflow-hidden` would trap a
        sticky child — so the wrapper below is what the reset button sticks to.
      */
      /*
        편의점 밑의 것들(말풍선 · 손님 · 알래봇 · 탁자)은 시안보다 21 아래 — 그림 바닥
        (24 + 189 = 213)과 말풍선 사이가 40 이 되게(사용자 지시). 장면 높이도 그만큼.
      */
      <div className="relative w-full shrink-0">
      {/*
        낮에는 하늘색으로 — 가로등을 끄고 간판 네온도 꺼진다. 그림(가게 · 나무 ·
        손님 · 테이블)은 그대로다. 색만 바꿔도 「밤이 낮이 됐다」로 읽힌다.
      */}
      <div
        className={`relative w-full overflow-hidden transition-colors duration-500 ${
          daylight ? "bg-day" : "bg-night"
        }`}
        style={{ height: far ? 781 : 566 }}
      >
        {/*
          낮 하늘 — 해 하나와 구름 둘. 색만 바꾼 낮은 밤에서 불을 끈 것으로
          보였다. 해는 가로등 맞은편(오른쪽 위, 다른 방 보기 단추 왼쪽)에 두고,
          구름은 가게 지붕 위 빈 하늘을 아주 천천히 지나간다(sky-drift). 아래로
          갈수록 조금 밝아지는 그러데이션은 땅 쪽 공기다 — 위 끝은 크롬과 같은
          하늘색이라 이음매가 없다.
        */}
        {daylight ? null : <Stars />}
        {daylight ? (
          <>
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(180deg,#dcefff_0%,#dcefff_120px,#eaf5ff_100%)]"
            />
            <span
              aria-hidden
              className="sun-glow absolute top-[26px] left-[276px] size-11 rounded-full bg-[radial-gradient(circle,#fff7c2_0%,#ffe27a_55%,#ffd24d_100%)] shadow-[0_0_18px_6px_rgba(255,222,110,0.55),0_0_44px_18px_rgba(255,230,140,0.28)]"
            />
            <Cloud className="sky-drift absolute top-[34px] left-[118px] w-[74px]" />
            <Cloud className="sky-drift-slow absolute top-[56px] left-[222px] w-[92px]" />
          </>
        ) : null}
        {/*
          앞 테이블 손님 — 761:1091 / 761:1099.

          손님은 밤 배경에 맞춘 옅은 회색 실루엣이라 낮 하늘 위에서는 거의
          안 보인다. 낮에는 한 단계 어둡게 내린다(GUEST_DAY) — 그림 파일을 두
          벌 두는 대신 필터로.
        */}
        <Img
          src="/assets/chat/guest-left.svg"
          className={`absolute top-[342px] left-[38px] h-[131.868px] w-[65.633px] max-w-none ${guestTone}`}
        />
        {seatCount(near) === 2 ? (
          <Img
            src="/assets/chat/guest-right.svg"
            className={`absolute top-[342px] left-[129px] h-[132.038px] w-[59.873px] max-w-none ${guestTone}`}
          />
        ) : null}

        {/* 뒤 테이블 손님 — 761:1083 / 761:1142, the second one mirrored */}
        {far ? (
          <>
            <Img
              src="/assets/chat/guests-pair.svg"
              className={`absolute top-[614px] left-[221px] h-[131.528px] w-[59.873px] max-w-none ${guestTone}`}
            />
            {seatCount(far) === 2 ? (
              <div className={`absolute top-[614px] left-[312px] h-[131.528px] w-[59.873px] ${guestTone}`}>
                <Img
                  src="/assets/chat/guest-head.png"
                  className="absolute top-0 left-[29.873px] size-[30px] max-w-none -scale-x-100"
                />
                <Img
                  src="/assets/chat/guest-body.svg"
                  className="absolute top-[35.019px] left-0 h-[96.509px] w-[55.932px] max-w-none -scale-x-100"
                />
              </div>
            ) : null}
          </>
        ) : null}

        <RoomBubble room={near} className="absolute top-[253px] left-[128px]" />
        {far ? <RoomBubble room={far} className="absolute top-[539px] left-[13px]" /> : null}

        {/*
          bubble tails — 761:1131 / 761:1132, the second one mirrored.

          말꼬리는 말풍선과 따로 놓인 그림이라 흐리기도 따로 해 줘야 한다. 조용한
          방을 흐렸더니 꼬리만 하얗게 남아, 풍선에서 떨어져 나온 조각으로 보였다.

          프레임 좌표대로 놓으면 꼬리 윗동이 말풍선 안으로 들어간다. 둘 다
          불투명할 때는 같은 흰색이라 안 보였는데, 흐려 놓으니 겹친 자리만 두
          번 칠해져 턱이 졌다. 겹치는 만큼을 잘라 말풍선 밑변에 딱 붙인다.

          자르는 길이가 위아래 다른 것은 두 자리의 프레임 좌표가 원래 다르기
          때문이다 — 위 12, 아래 9. 말풍선 높이(65)가 고정이라 이 값도 방이
          바뀌어도 그대로다.
        */}
        <Img
          src="/assets/chat/tail-a.svg"
          className={`absolute top-[306px] left-[209px] h-[44.5px] w-[50px] max-w-none [clip-path:inset(12px_0_0_0)] ${
            hasTalk(near.id) ? "" : "opacity-55"
          }`}
        />
        {far ? (
          <Img
            src="/assets/chat/tail-a.svg"
            className={`absolute top-[595px] left-[145px] h-[44.5px] w-[50px] max-w-none -scale-x-100 [clip-path:inset(9px_0_0_0)] ${
              hasTalk(far.id) ? "" : "opacity-55"
            }`}
          />
        ) : null}

        <PicnicTable className="absolute top-[401px] left-[43px]" />
        <PicnicTable className="absolute top-[667px] left-[229px]" />

        {/*
          편의점 — 시안 1968:6553(디자이너가 새로 그린 외관: 가로등 · 상자 · 휴지통 ·
          간판 · 차양 · 파라솔 탁자). 피그마 내보내기 한 장(storefront.svg, 1435 × 848)을
          320 폭으로 놓는다 — 배율 0.223, 가게 몸통이 옛 그림(240 × 115)과 같은 크기가
          되는 폭(366 은 너무 컸다, 사용자 지적). 빛줄기(Rectangle 56)만 따로 떼어
          (storefront-beam.svg, 같은 viewBox) 같은 자리에 겹친다 — 기둥은 가만히 두고 빛만
          흔들기 위해서다. 전에는 나무 · 가게 · 가로등이 따로였다(761:1255).

          간판 · 등알 자리는 그림 안 좌표에 배율을 곱한 것: 간판 흰 면(Vector_13)
          679.7, 299 · 415 × 85.4 → 126, 42 · 92.5 × 19, 등알(Rectangle 55) 가운데 507, 154
          → 87.5, 9.4. 그림 원점은 viewBox 의 (115, 112).
        */}
        <div className="absolute top-[24px] left-[calc(50%-3.5px)] h-[189px] w-[320px] -translate-x-1/2">
          <Img
            src="/assets/chat/storefront.svg"
            className="absolute inset-0 h-full w-full max-w-none"
          />
          {/*
            간판 네온 — 간판 흰 면 자리에 딱 맞춘 빈 상자다. 안은 비워 두고 바깥으로만
            초록빛을 흘려서, 간판 그림은 그대로 두고 둘레만 달아오르게 한다.
          */}
          {daylight ? null : (
            <span
              aria-hidden
              className="neon-sign absolute top-[41.7px] left-[125.9px] h-[19px] w-[92.5px] rounded-[9.5px] shadow-[0_0_9px_1px_rgba(52,190,140,0.8),0_0_20px_6px_rgba(52,190,140,0.45)]"
            />
          )}
          {/*
            가로등 불 — 기둥은 가만히 두고 빛만 흔든다(lamp-flicker). 빛줄기는 그림과
            같은 viewBox 라 같은 상자에 겹쳐 놓기만 하면 원래 자리에 맞는다.
          */}
          {daylight ? null : (
            <Img
              src="/assets/chat/storefront-beam.svg"
              aria-hidden
              className="lamp-flicker absolute inset-0 h-full w-full max-w-none"
            />
          )}
          {/*
            알 언저리 번짐 — 빛줄기만 흔들면 정작 등은 안 켜진 것처럼 보인다.
            등알 가운데(87.5, 9.4)에 32px 짜리 번짐을 얹어 빛줄기와 같은 박자로 흔든다.
          */}
          {daylight ? null : (
            <span
              aria-hidden
              className="lamp-flicker absolute -top-[7px] left-[72px] size-8 rounded-full bg-[radial-gradient(circle,rgba(255,226,120,0.8)_0%,rgba(255,226,120,0)_70%)]"
            />
          )}
          {/*
            가로등 스위치 — 등알(번짐 자리 72, -7 · 32px) 위에 44px 손가락 판을
            놓는다. 누르면 낮과 밤이 바뀐다. 그림 위에 얹힌 투명 단추라 보이지는
            않고, 등이 켜지고 꺼지는 것이 곧 반응이다.
          */}
          <button
            type="button"
            aria-label={daylight ? "가로등 켜기 — 밤으로" : "가로등 끄기 — 낮으로"}
            aria-pressed={daylight}
            onClick={toggleDaylight}
            className="absolute -top-[13px] left-[66px] size-11 rounded-full"
          />
          {/*
            안내 — 등알 오른쪽에 말풍선처럼 붙는다. 홈의 「터치하면 인사해요!」와
            같은 꼴이되 밤하늘 위라 흰 바탕이다. 왼쪽에 작은 꼭지가 등을 가리킨다.
            바탕은 불투명해야 한다 — 비치면 꼭지와 겹치는 자리가 두 겹으로 보인다.
            읽어 주지는 않는다 — 단추 이름이 이미 말해 준다. 한 번 누르면 거둔다.
          */}
          {lampTried ? null : (
            <span
              aria-hidden
              className="lamp-hint absolute top-[0px] left-[116px] rounded-full bg-white px-[9px] py-[3px] text-[11px] leading-[1.4] whitespace-nowrap text-gray-700"
            >
              {LAMP_HINT}
            </span>
          )}
        </div>

      </div>

      {/*
        바닥 그늘 — 탭 바에 잘린 그림(뒤 테이블 말풍선의 윗변)이 탭 바 바로 위에
        한 줄 삐죽 보였다(사용자 지적). 스크롤 상자 바닥에 붙어(sticky) 하늘색으로
        스며들게 해서, 잘린 자리가 선이 아니라 그늘이 되게 한다. 아래 셋째(약 13px)는
        아예 덮는다 — 흐릿하게만 깔면 흰 윗변이 비쳐 여전히 선으로 보였다. 장면
        높이는 안 늘린다(-mt). 낮에는 땅 쪽 하늘색, 밤에는 밤색.
      */}
      <div
        aria-hidden
        className={`pointer-events-none sticky bottom-0 -mt-9 h-9 w-full bg-linear-to-t from-35% to-transparent ${
          daylight ? "from-[#e6f3ff]" : "from-night"
        }`}
      />

      </div>
      )}
    </main>
  );
}
