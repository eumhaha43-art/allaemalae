/**
 * 공유 — 지금 보는 화면의 주소를 복사한다. 배포된 앱에서 열면 그 주소가
 * 들어간다. 클립보드가 막힌 곳(http 나 권한 없음)에서는 숨은 글상자에 넣고
 * 복사 명령을 내린다 — 그것마저 안 되면 실패했다고 알린다.
 *
 * 지식 상세 둘(글 카드 · 카드뉴스)이 같이 쓴다.
 */
export async function copyLink(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    const box = document.createElement("textarea");
    box.value = url;
    box.setAttribute("readonly", "");
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    box.remove();
    return ok;
  }
}
