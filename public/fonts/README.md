# 영수증 손글씨 글꼴

꾸미기 화면에서 고르는 손글씨체 넷. 구글 폰트 CDN 대신 여기서 직접 내준다 — CDN 은
한글을 100 여 조각(unicode-range)으로 나눠 글자가 나올 때마다 조각을 받아서, 글꼴을
누르는 순간 글씨가 사라졌다 나타났다(감수 지적). 한 파일이면 `Receipt` 가 데워 둔
것이 곧 전체다. 발표장 네트워크에 매이지 않는 것은 덤.

| 글꼴 | 파일 | 원본 | 저작권 | 라이선스 |
|---|---|---|---|---|
| Gamja Flower(감자꽃) | `gamja-flower.woff2` | [google/fonts · ofl/gamjaflower](https://github.com/google/fonts/tree/main/ofl/gamjaflower) | © YoonDesign Inc. | OFL 1.1 |
| East Sea Dokdo(동해독도) | `east-sea-dokdo.woff2` | [google/fonts · ofl/eastseadokdo](https://github.com/google/fonts/tree/main/ofl/eastseadokdo) | © YoonDesign Inc. | OFL 1.1 |
| Nanum Pen Script(펜글씨) | `nanum-pen-script.woff2` | [google/fonts · ofl/nanumpenscript](https://github.com/google/fonts/tree/main/ofl/nanumpenscript) | © 2010 NHN Corporation (Reserved Font Name: Nanum, NanumPen …) | OFL 1.1 |
| Yeon Sung(연성) | `yeon-sung.woff2` | [google/fonts · ofl/yeonsung](https://github.com/google/fonts/tree/main/ofl/yeonsung) | © 2018 The BM YEONSUNG Project Authors | OFL 1.1 |

라이선스 본문과 저작권 표시는 `OFL.txt`. 네 글꼴 모두 SIL Open Font License 1.1 이라
서브셋 · 재배포가 허용되고, 이름을 바꿔 팔지 않는 한 그대로 쓸 수 있다.

## 서브셋

원본 TTF(각 2.5 ~ 12.6 MB)에서 아래 글자만 남겨 woff2 로 만들었다(harfbuzz 기반
`subset-font`). 합쳐서 약 1.4 MB.

- KS X 1001 완성형 한글 2350 자
- ASCII 인쇄 가능 문자(U+0020 ~ U+007E)
- 영수증에 쓰는 기호 — 가운뎃점 · 따옴표 · 줄표 · 말줄임 · 원 기호 · 화살표 · 한글 자모 · × ÷ ° ℃

완성형에 없는 글자(「똠」 같은 것)는 스택의 다음 글꼴(Apple SD Gothic Neo)로 받쳐진다.

글꼴 이름(`@font-face` 의 family)은 구글 폰트가 내주던 이름 그대로라, 고르는 표
(`src/data/common/record.ts` 의 `fonts`)는 손대지 않았다. 선언은 `src/styles/globals.css`.
