/**
 * 2벌식 한글 조합기 (Korean jamo composer).
 *
 * The on-screen keyboard emits single jamo (ㅂ, ㅏ, …). A real IME turns those
 * into syllables — ㅂ + ㅏ → 바, + ㄱ → 박 — so we need the same automaton here.
 * Physical typing on desktop goes through the OS IME instead and never touches
 * this; call `resetComposition` whenever the value changes from outside.
 */

const CHO = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

const JUNG = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ",
  "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ",
];

const JONG = [
  "", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ",
  "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ",
  "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

/** ㅗ + ㅏ → ㅘ */
const VOWEL_PAIRS: Record<string, string> = {
  "ㅗㅏ": "ㅘ", "ㅗㅐ": "ㅙ", "ㅗㅣ": "ㅚ",
  "ㅜㅓ": "ㅝ", "ㅜㅔ": "ㅞ", "ㅜㅣ": "ㅟ",
  "ㅡㅣ": "ㅢ",
};

/** ㄱ + ㅅ → ㄳ */
const JONG_PAIRS: Record<string, string> = {
  "ㄱㅅ": "ㄳ",
  "ㄴㅈ": "ㄵ", "ㄴㅎ": "ㄶ",
  "ㄹㄱ": "ㄺ", "ㄹㅁ": "ㄻ", "ㄹㅂ": "ㄼ", "ㄹㅅ": "ㄽ",
  "ㄹㅌ": "ㄾ", "ㄹㅍ": "ㄿ", "ㄹㅎ": "ㅀ",
  "ㅂㅅ": "ㅄ",
};

const splitPair = (pairs: Record<string, string>, combined: string): [string, string] | null => {
  const key = Object.keys(pairs).find((k) => pairs[k] === combined);
  return key ? [key[0], key[1]] : null;
};

/** A syllable still being assembled. `-1` / `0` mean "not typed yet". */
export type Composition = { cho: number; jung: number; jong: number } | null;

/** What the in-progress syllable currently looks like on screen. */
export function renderComposition(comp: Composition): string {
  if (!comp) return "";
  const { cho, jung, jong } = comp;
  if (cho >= 0 && jung >= 0) {
    return String.fromCharCode(0xac00 + (cho * 21 + jung) * 28 + jong);
  }
  if (cho >= 0) return CHO[cho];
  if (jung >= 0) return JUNG[jung];
  return "";
}

/** Drop the in-progress syllable, leaving the committed text before it. */
function committedPart(value: string, comp: Composition): string {
  const tail = renderComposition(comp);
  return tail && value.endsWith(tail) ? value.slice(0, value.length - tail.length) : value;
}

type Result = { value: string; comp: Composition };

const build = (committed: string, comp: Composition): Result => ({
  value: committed + renderComposition(comp),
  comp,
});

/** Feed one jamo from the on-screen keyboard. */
export function applyJamo(value: string, comp: Composition, jamo: string): Result {
  const committed = committedPart(value, comp);
  const jungIndex = JUNG.indexOf(jamo);

  if (jungIndex >= 0) return applyVowel(committed, comp, jungIndex);
  return applyConsonant(committed, comp, jamo);
}

function applyVowel(committed: string, comp: Composition, jungIndex: number): Result {
  if (!comp) return build(committed, { cho: -1, jung: jungIndex, jong: 0 });

  // A finished syllable with a batchim: the batchim jumps to the next syllable.
  // 각 + ㅏ → 가 + 가
  if (comp.jong > 0) {
    const parts = splitPair(JONG_PAIRS, JONG[comp.jong]);
    const [keep, moved] = parts ?? ["", JONG[comp.jong]];
    const done = renderComposition({ ...comp, jong: keep ? JONG.indexOf(keep) : 0 });
    return build(committed + done, { cho: CHO.indexOf(moved), jung: jungIndex, jong: 0 });
  }

  if (comp.jung >= 0) {
    const combined = VOWEL_PAIRS[JUNG[comp.jung] + JUNG[jungIndex]];
    if (combined) return build(committed, { ...comp, jung: JUNG.indexOf(combined) });
    // Two vowels that do not merge: the first one is done.
    return build(committed + renderComposition(comp), { cho: -1, jung: jungIndex, jong: 0 });
  }

  return build(committed, { ...comp, jung: jungIndex });
}

function applyConsonant(committed: string, comp: Composition, jamo: string): Result {
  const asCho = CHO.indexOf(jamo);
  const start = (text: string): Result =>
    asCho >= 0
      ? build(text, { cho: asCho, jung: -1, jong: 0 })
      : { value: text + jamo, comp: null };

  if (!comp) return start(committed);

  // Only a lead consonant so far — it cannot take another one.
  if (comp.jung < 0) return start(committed + renderComposition(comp));

  if (comp.jong === 0) {
    const asJong = JONG.indexOf(jamo);
    if (asJong > 0) return build(committed, { ...comp, jong: asJong });
    return start(committed + renderComposition(comp));
  }

  const combined = JONG_PAIRS[JONG[comp.jong] + jamo];
  if (combined) return build(committed, { ...comp, jong: JONG.indexOf(combined) });
  return start(committed + renderComposition(comp));
}

/** Backspace: peel one jamo off the syllable in progress, else one character. */
export function applyBackspace(value: string, comp: Composition): Result {
  const committed = committedPart(value, comp);

  if (comp) {
    if (comp.jong > 0) {
      const parts = splitPair(JONG_PAIRS, JONG[comp.jong]);
      const jong = parts ? JONG.indexOf(parts[0]) : 0;
      return build(committed, { ...comp, jong });
    }
    if (comp.jung >= 0) {
      const parts = splitPair(VOWEL_PAIRS, JUNG[comp.jung]);
      if (parts) return build(committed, { ...comp, jung: JUNG.indexOf(parts[0]) });
      return comp.cho >= 0
        ? build(committed, { ...comp, jung: -1 })
        : build(committed, null);
    }
    return build(committed, null);
  }

  // No composition: drop one character, keeping surrogate pairs intact.
  return { value: [...committed].slice(0, -1).join(""), comp: null };
}

/** Append text that needs no composition (space, newline, punctuation). */
export function applyLiteral(value: string, comp: Composition, text: string): Result {
  return { value: committedPart(value, comp) + renderComposition(comp) + text, comp: null };
}
