import AppHeader from "@/components/common/AppHeader";

/**
 * 뒤로 · 제목 · 등록 — Figma 941:2572 (공통 헤더 Header03).
 *
 * 틀은 공통 헤더가 쥐고, 이 화면만의 등록 단추를 오른쪽에 끼운다.
 * 예전 프레임은 X 였는데 뒤로가기로 바뀌었다. 누르면 하던 동작(임시저장을
 * 물어보고 나가기)은 그대로다.
 *
 * 위에 붙어 따라온다 — 긴 글을 쓰다 보면 등록 단추가 화면 밖으로 밀려서,
 * 다 쓰고 나서 맨 위까지 되돌아가야 했다. 60px 이 입력칸에서 빠지지만 등록
 * 단추가 늘 손 닿는 곳에 있는 쪽이 낫다.
 */
export default function WriteHeader({
  title,
  submitLabel,
  onClose,
}: {
  title: string;
  submitLabel: string;
  onClose: () => void;
}) {
  return (
    <AppHeader back={onClose} title={title} titleSize={16} divider>
      {/*
        Always the brand green (#008154), as in the design. Rather than fading
        the button out when the form is incomplete, submitting jumps to the
        first field that still needs filling.
      */}
      <button
        type="submit"
        className="tap rounded-[10px] bg-primary-600 px-5 py-2 text-sm leading-5 font-semibold tracking-[-0.28px] text-white"
      >
        {submitLabel}
      </button>
    </AppHeader>
  );
}
