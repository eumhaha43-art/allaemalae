import Img from "@/components/common/Img";

/** Bordered input / textarea shell shared by the 소개 step. */
export const FIELD =
  "w-full rounded-xl border border-[#e5e5e5] bg-white px-[18px] py-[15px] text-[15px] leading-[1.5] text-[#17171a] outline-none placeholder:text-[#bdbdc0] focus:border-primary-600";

/**
 * Collapsible setting row — label and current value on one line, the control
 * underneath once it is opened.
 */
export function Accordion({
  icon,
  label,
  value,
  open,
  onToggle,
  children,
}: {
  icon: string;
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="w-full border-b border-[#f0f0f0] pb-4">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className="flex w-full items-center gap-[10px] py-4"
      >
        <Img src={icon} className="size-[18px] shrink-0" />
        <span className="text-[15px] leading-[1.4] font-medium text-[#17171a]">{label}</span>
        <div className="flex-1" />
        <span className="text-[15px] leading-[1.4] text-[#6a6a6e]">{value}</span>
        <Img
          src="/assets/chat/sort-caret.svg"
          className={`size-[13px] shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? children : null}
    </section>
  );
}

/** One of the 신청 방식 choices. The picked one fills with the brand green. */
export function OptionCard({
  title,
  lines,
  selected,
  onClick,
}: {
  title: string;
  lines: string[];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`flex w-full flex-col items-start gap-[6px] rounded-xl px-[18px] py-4 text-left ${
        selected ? "bg-primary-600" : "border border-[#e5e5e5] bg-white"
      }`}
    >
      <span
        className={`text-[15px] leading-[1.4] font-bold ${selected ? "text-white" : "text-[#17171a]"}`}
      >
        {title}
      </span>
      {lines.map((line) => (
        <span
          key={line}
          className={`text-[13px] leading-[1.5] ${selected ? "text-white/85" : "text-[#9a9a9e]"}`}
        >
          {line}
        </span>
      ))}
    </button>
  );
}

/** One 방 규칙 line — a filled green box when the host keeps the rule on. */
export function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={onToggle}
      className="flex w-full items-center gap-[10px] py-[9px] text-left"
    >
      <span
        className={`flex size-[22px] shrink-0 items-center justify-center rounded-[6px] ${
          checked ? "bg-primary-600" : "border border-[#d2d2d2] bg-white"
        }`}
      >
        {checked ? (
          <span className="mt-[-3px] h-[9px] w-[5px] rotate-45 border-r-2 border-b-2 border-white" />
        ) : null}
      </span>
      <span
        className={`text-[14px] leading-[1.4] ${checked ? "text-[#17171a]" : "text-[#9a9a9e]"}`}
      >
        {label}
      </span>
    </button>
  );
}
