"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Img from "@/components/common/Img";
import AppHeader from "@/components/common/AppHeader";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";
import Basket from "@/components/cart/Basket";
import KnowledgeCard from "@/components/cart/KnowledgeCard";
import KnowledgeRow from "@/components/cart/KnowledgeRow";
import RiseIn from "@/components/home/RiseIn";
import UnderlineTabs from "@/components/menu/UnderlineTabs";
import { ACTION_BTN, ACTION_DISABLED, ACTION_ON } from "@/components/common/actionButton";
import { getCartBadge } from "@/state/cartFlightStore";
import { takeCartTab } from "@/state/cartTabStore";
import { removeFromCart } from "@/state/cartStore";
import { printReceipt } from "@/state/receiptStore";
import { showToast } from "@/state/toastStore";
import {
  actionLabel,
  countLabel,
  doneBanner,
  fridge,
  stateNote,
  tabs,
} from "@/data/common/cart";
import { getKnowledge, knowledgeIdFor } from "@/data/common/knowledge";
import { isReadyKnowledge } from "@/data/common/menu";
import { useFridge } from "@/hooks/useFridge";
import type { CartItem } from "@/types/cart";

/**
 * 장바구니 — Figma node 1021:15139.
 *
 * 담은 지식이 편의점 장바구니 안에 상품처럼 쌓인다.
 *
 * 고르는 것은 「다 먹음」 탭뿐이다 — 여럿 골라 영수증을 뽑거나 뺀다. 「전체」와
 * 「먹는 중」에서는 카드를 누르면 곧장 그 지식으로 간다(사용자 요청 — 골라 놓고
 * 아래 단추를 또 누르는 두 걸음이 헛걸음이었다). 아래 단추도 다 먹음 탭에만
 * 있다 — 영수증은 다 먹음 탭에서만 뽑을 수 있어야 그 탭이 무엇인지 읽힌다(기획
 * 피드백). 탭을 바꾸면 고른 것을 비운다 — 안 보이는 탭의 것이 몰래 세어지면
 * 숫자가 안 맞는다.
 *
 * 지식은 두 단계를 지난다(사용자가 정한 흐름 — 「담아둠」은 없앴다).
 *
 * - 먹는 중 — 담기 단추로 담은 것(reactionStore)은 곧바로 여기 0% 로 선다.
 *   지식 상세가 넘긴 장을 적어 두므로(cartStore.opened) 들어갔다 돌아오면 본
 *   만큼 진행률이 오른다. 홈의 「남겨둔 지식 상품」 셋은 처음부터 여기 있다.
 * - 다 먹음 — 상세에서 카드를 마지막 장까지 본 것(opened 가 100). 처음부터
 *   놓인 여섯도 여기다.
 *
 * 처음부터 놓인 것들(useShelf)은 쓰던 사람의 것이다 — 막 가입한 사람은 빈
 * 장바구니로 시작한다.
 *
 * 열어 본 기록은 지식 id 로 찾는다(knowledgeIdFor) — 같은 지식이 어느 이름으로
 * 담겼든 들어가 봤으면 들어가 본 것이다. 같은 지식은 한 칸이다(사용자 요청) —
 * 담기 단추가 이미 막지만(useCartEntry), 혹시 두 이름으로 들어와도 더 나아간
 * 단계 하나만 남긴다(dedupe).
 *
 * 고른 것은 뺄 수도 있다 — 아래 단추 왼쪽의 「빼기」. 홈에서 담은 것은 담은
 * 목록에서 지워지고, 처음부터 있던 것은 뺐다고 적힌다(cartStore.removed).
 *
 * 처음 여는 탭은 어떻게 왔느냐에 달렸다. 기록의 「더 담으러 가기」로 왔으면
 * 「다 먹음」(cartTabStore) — 영수증에 얹을 것을 고르러 온 것이다. 방금 홈에서
 * 담고 왔으면(탭 바 배지가 켜져 있으면) 「먹는 중」— 담은 게 어디 갔는지 바로
 * 보여야 한다. 그냥 들어왔으면 디자인대로 「전체」다. 둘 다 새로고침에 비워지므로
 * 서버가 그린 것(전체)과 첫 그림이 어긋날 일은 없다.
 */
export default function CartPage() {
  const router = useRouter();
  // 기록의 「더 담으러 가기」가 다 먹음 탭을 부탁해 두면 그 탭부터(cartTabStore)
  const [tab, setTabOnly] = useState<(typeof tabs)[number]>(
    () => takeCartTab() ?? (getCartBadge() > 0 ? "먹는 중" : "전체"),
  );
  const [picked, setPicked] = useState<string[]>([]);
  const setTab = (next: (typeof tabs)[number]) => {
    setTabOnly(next);
    setPicked([]);
  };
  /** 격자 ↔ 목록. 단추에는 지금 보는 것이 아니라 「넘어갈 쪽」 그림을 단다. */
  const [view, setView] = useState<"grid" | "list">("grid");
  /** 빼기를 묻는 중 — 확인 없이 바로 빠지면 잘못 누른 것을 되돌릴 길이 없다(감수 지적) */
  const [removing, setRemoving] = useState(false);

  /* 봉투에 든 줄 — 홈의 「남겨둔 지식 상품」도 같은 것을 본다(useFridge · 사용자 지시) */
  const all = useFridge();

  const shown = tab === "전체" ? all : all.filter((item) => item.state === tab);
  const chosen = shown.filter((item) => picked.includes(item.id));
  const pickedHere = chosen.length;
  /** 다 먹음 탭 — 여럿 골라 영수증을 뽑는 유일한 자리 */
  const receipts = tab === "다 먹음";

  /* 다 먹음 탭에서만 고른다 — 여럿. 나머지 탭에서는 누르면 그 지식으로 간다. */
  const toggle = (item: CartItem) =>
    setPicked((now) =>
      now.includes(item.id) ? now.filter((x) => x !== item.id) : [...now, item.id],
    );
  /* 카드뉴스가 없는 지식(글만 있는 옛 상세)은 못 들어간다 — 준비 중이라고만 한다(사용자 지시). 분야 목록이 잠그는 것과 같은 기준 */
  const open = (item: CartItem) => {
    const id = knowledgeIdFor(item.id);
    const post = getKnowledge(id);
    if (post && !isReadyKnowledge(post)) {
      showToast(fridge.soon);
      return;
    }
    router.push(`/menu/knowledge/${id}`);
  };

  const remove = () => {
    if (!chosen.length) return;
    const count = chosen.length;
    const undo = removeFromCart(chosen.map((item) => item.id));
    setPicked([]);
    setRemoving(false);
    // 빼고 나서도 한동안은 되돌릴 수 있다 — 알림의 「되돌리기」
    showToast(actionLabel.removed(count), 4000, { label: actionLabel.undo, run: undo });
  };

  const act = () => {
    if (!chosen.length) return;
    printReceipt(chosen.map((item) => ({ title: item.title.join(" "), price: "1코인" })));
    router.push("/record");
  };

  return (
    // min-h-0 — 화면 높이에 멈춰야 봉투가 남는 세로를 받고 안에서만 넘긴다(Basket). 없으면 main 이 카드만큼 자라 화면째 넘어간다
    <main className="flex min-h-0 flex-1 flex-col bg-[#f9f9f9]">
      <AppHeader title={fridge.title} />

      {/* 헤더(60) 바로 밑에 붙어 같이 떠 있는다 — 내려 읽다가도 탭을 바꿀 수 있어야 한다(사용자 지적: 탭이 따라 올라갔다) */}
      <div className="sticky top-[60px] z-20 bg-white">
        <UnderlineTabs tabs={tabs} value={tab} onChange={setTab} />
      </div>

      {/* 두 상태가 무엇인지 · 다 먹음 탭에서는 영수증을 뽑을 수 있다는 것 — 카드만 섞여 있으면 알 수 없다 */}
      {receipts ? (
        <p className="mx-6 mt-3 rounded-[10px] bg-[#CDE9DA] px-3 py-2 text-center text-xs leading-[1.4] font-medium text-primary-800">
          {doneBanner}
        </p>
      ) : (
        <p className="mx-6 mt-3 text-[11px] leading-[1.45] text-gray-500">{stateNote}</p>
      )}

      <div className="flex w-full shrink-0 items-center justify-between px-[26px] pt-2 pb-3">
        <p className="text-xs leading-[1.3] text-[#111827]">
          {countLabel[tab]} <span className="text-primary-700">{shown.length}</span>개
        </p>

        {/* 「최근순 ⌄」 단추와 그 옆 세로 선은 뺐다(사용자 지시) — 보기 바꾸는 단추만 남는다 */}
        <div className="flex items-center">
          <button
            type="button"
            aria-label={view === "grid" ? "목록으로 보기" : "격자로 보기"}
            onClick={() => setView(view === "grid" ? "list" : "grid")}
            className="tap flex px-[10px] py-1 transition-opacity active:opacity-55"
          >
            <Img
              src={view === "grid" ? "/assets/cart/view-list.svg" : "/assets/cart/view-grid.svg"}
              className="size-5"
            />
          </button>
        </div>
      </div>

      {shown.length ? (
        /*
          냉장고 봉투(Basket, 2012:6870) — 남는 세로를 다 받아 배경처럼 가만히 있고, 카드는
          그 안에서 두 줄(2열)로 넘겨진다(사용자 지시 — 봉투는 안 움직이고 카드만).
          옆 여백은 12 — 시안의 봉투가 화면에 거의 꽉 찬다. 아래는 탭 바에서 12 띄운다.
        */
        <div className="flex min-h-0 flex-1 flex-col px-3 pb-3">
          <Basket>
            {view === "grid" ? (
              <div className="grid grid-cols-2 gap-x-[18px] gap-y-[17px]">
                {/*
                  카드는 왼쪽 위부터 차례로 떠오른다(RiseIn — 홈 섹션과 같은 것, 사용자 요청). 목록 보기는 그대로.
                  key 에 탭을 붙인다 — 탭을 바꿔도 남는 카드는 같은 요소라 다시 안 떠올랐다(사용자 지적).
                  탭이 바뀌면 새로 붙어 다시 떠오르고, 정렬만 바꿀 때는 그대로다.
                */}
                {shown.map((item, i) => (
                  <RiseIn key={`${tab}-${item.id}`} order={i}>
                    <KnowledgeCard
                      item={item}
                      picked={receipts ? picked.includes(item.id) : undefined}
                      onPress={() => (receipts ? toggle(item) : open(item))}
                    />
                  </RiseIn>
                ))}
              </div>
            ) : (
              <div className="flex w-full flex-col gap-[10px]">
                {shown.map((item) => (
                  <KnowledgeRow
                    key={item.id}
                    item={item}
                    picked={receipts ? picked.includes(item.id) : undefined}
                    onPress={() => (receipts ? toggle(item) : open(item))}
                  />
                ))}
              </div>
            )}
          </Basket>
        </div>
      ) : (
        /* 빈 냉장고 — 쓰레기통 그림(1968:7195)을 남는 자리 한가운데에(기록 · 검색과 같은 EmptyState). 막 가입한 사람이 여기다 */
        <EmptyState icon="/assets/cart/empty.svg" text={fridge.empty} />
      )}

      {/*
        다 먹음 탭에만 있다 — 바닥에 붙여 둔다. 그냥 흐름에 두면 화면이 조금만
        짧아도(667px) 탭 바 아래로 밀려, 스크롤하기 전에는 이 화면의 주 동작이
        아예 안 보인다. 배경을 화면과 같은 색으로 줘서 목록이 그 아래로 지나가게
        한다. 다른 탭에서는 카드가 곧 단추라 아래 단추가 없다. z 는 카드 위의
        완독 도장 · 고르기 동그라미(z-10)보다 위 — 안 그러면 목록을 내릴 때 그것들이
        이 줄 앞으로 튀어나왔다(사용자 지적).
      */}
      {receipts ? (
        <div className="sticky bottom-0 z-20 flex w-full shrink-0 flex-col gap-2 bg-[#f9f9f9] px-6 pt-3 pb-5">
          {/* 아직 안 골랐으면 무엇을 하라는지 한 줄 */}
          {pickedHere === 0 ? (
            <p className="text-center text-xs leading-[1.3] text-gray-500">{actionLabel.pickHint}</p>
          ) : null}
          <div className="flex w-full justify-center gap-2">
            {/* 고른 것이 있을 때만 — 빼기는 주 동작이 아니라 곁에 선다 */}
            {pickedHere > 0 ? (
              <button
                type="button"
                onClick={() => setRemoving(true)}
                className={`${ACTION_BTN} w-[92px] shrink-0 border border-gray-300 bg-white text-gray-700 transition-opacity active:opacity-60`}
              >
                {actionLabel.remove}
              </button>
            ) : null}
            <button
              type="button"
              onClick={act}
              disabled={pickedHere === 0}
              className={`${ACTION_BTN} ${ACTION_ON} ${ACTION_DISABLED} min-w-px flex-1`}
            >
              {pickedHere === 0 ? (
                actionLabel.receiptIdle
              ) : (
                <>
                  <span className="hidden min-[360px]:inline">{actionLabel.receipt(pickedHere)}</span>
                  <span className="min-[360px]:hidden">{actionLabel.receiptShort(pickedHere)}</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={removing}
        title={actionLabel.removeAsk(pickedHere)}
        description={actionLabel.removeNote}
        confirmLabel={actionLabel.remove}
        cancelLabel={actionLabel.keep}
        onConfirm={remove}
        onCancel={() => setRemoving(false)}
      />
    </main>
  );
}
