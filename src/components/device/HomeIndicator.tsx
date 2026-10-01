"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Img from "@/components/common/Img";
import { isFullscreenRoute } from "@/routes/paths";
import {
  getKeyboardOpen,
  getKeyboardServerSnapshot,
  subscribeKeyboard,
} from "@/state/keyboardStore";

/** iOS home indicator — Figma node 2:62 (bottom_wrap) */
export default function HomeIndicator() {
  const pathname = usePathname();

  const keyboard = useSyncExternalStore(
    subscribeKeyboard,
    getKeyboardOpen,
    getKeyboardServerSnapshot,
  );

  if (isFullscreenRoute(pathname) || keyboard) return null;

  return (
    <div className="home-bar relative h-[34px] w-full shrink-0 bg-white">
      <Img
        src="/assets/home-indicator.svg"
        className="absolute bottom-2 left-1/2 h-[5px] w-[134px] -translate-x-1/2"
      />
    </div>
  );
}
