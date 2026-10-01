/**
 * Picnic table in the chat lobby scene — Figma nodes 761:1137 / 761:1150.
 *
 * Drawn with plain divs because Figma has it as four rounded rectangles rather
 * than an exported vector. The box is 140.5 x 90.338; `className` is where the
 * caller positions it (it must include `absolute`, which the legs anchor to).
 */
export default function PicnicTable({ className }: { className?: string }) {
  return (
    <div className={`h-[90.338px] w-[140.5px] ${className ?? ""}`}>
      {/* bench */}
      <div className="absolute top-[34.83px] left-[-0.25px] h-[18px] w-[141px] rounded-[5.5px] bg-[#8e7763]" />

      {/* the two crossed legs */}
      <div className="absolute top-[6.5px] left-[11.25px] flex h-[83.838px] w-[57.719px] items-center justify-center">
        <div className="flex-none rotate-[30.52deg]">
          <div className="h-[88.628px] w-[14.75px] rounded-[4.5px] bg-[#725033]" />
        </div>
      </div>
      <div className="absolute top-[6.5px] left-[69px] flex h-[83.838px] w-[57.719px] items-center justify-center">
        <div className="flex-none -scale-y-100 rotate-[149.48deg]">
          <div className="h-[88.628px] w-[14.75px] rounded-[4.5px] bg-[#725033]" />
        </div>
      </div>

      {/* table top */}
      <div className="absolute top-[6.83px] left-[16.75px] h-[12px] w-[103px] rounded-[9.25px] bg-[#5f432b]" />
    </div>
  );
}
