# Next.js 이해하기

이 프로젝트가 Next.js 위에 있는 이유와, Next 가 여기서 실제로 무엇을 하고
있는지를 **이 저장소의 파일로** 설명한다. 요구사항([`01_구현_요구사항.md`](./01_구현_요구사항.md)
7-1)은 React + TypeScript + Vite 를 기본으로 적고 있지만, 2026-09-15 에 **Next 를
그대로 두기로 결정**했다(7장). 인계 문서는 [`03_작업_인계.md`](./03_작업_인계.md).

---

## 1. Vite 와 Next 는 무엇이 다른가

둘 다 React 앱을 만드는 도구지만 맡는 범위가 다르다.

| | Vite | Next.js |
|---|---|---|
| 정체 | **빌드 도구** — TS/JSX 를 브라우저용 JS 로 바꾸고 개발 서버를 띄운다 | **프레임워크** — 빌드 + 라우팅 + 서버 + 렌더링 규칙이 한 세트 |
| 라우팅 | 없음. React Router 를 따로 붙인다 | 폴더 구조가 곧 URL (`src/app/record/page.tsx` → `/record`) |
| 서버 | 없음. 결과물은 정적 파일(HTML 1 + JS + CSS) | 있음. 같은 프로젝트에 서버 코드를 둘 수 있다 (`app/api/**/route.ts`) |
| 첫 화면 | 빈 HTML 을 받고 JS 가 그린다(CSR) | 서버가 HTML 을 먼저 만들어 보낸다(SSR / 서버 컴포넌트) |
| 배포 | 아무 정적 호스팅 | Node 서버가 필요. 사실상 Vercel 이 가장 편하다 |
| 배울 것 | 적다 | 많고, 버전마다 바뀐다 |

한 줄로: **Vite 는 "React 앱 조립기", Next 는 "조립기 + 라우터 + 서버 + 렌더링
규칙을 한데 묶은 것".**

---

## 2. 이 프로젝트에서 Next 가 하는 일

### 2-1. 파일이 곧 주소 — App Router

`src/app/` 아래 폴더가 URL 이고, 그 안의 `page.tsx` 가 그 주소의 화면이다.

```
src/app/
├─ layout.tsx                  모든 화면을 감싸는 틀 (html · body · ShowcaseLayout)
├─ page.tsx                    /
├─ cart/page.tsx               /cart
├─ community/page.tsx          /community
├─ community/post/[postId]/    /community/post/brain   ← [ ] 는 동적 세그먼트
├─ menu/knowledge/[id]/        /menu/knowledge/cul-2
├─ onboarding/
│   ├─ page.tsx                /onboarding
│   ├─ _components/            밑줄 폴더는 라우트로 세지 않는다 — 화면 전용 부품
│   ├─ _data/
│   └─ _lib/
└─ api/ai/route.ts             POST /api/ai  ← 화면이 아니라 서버 함수
```

- `[postId]` 처럼 대괄호 폴더는 **동적 세그먼트**다. 그 값은 `params` 로 들어온다.
- `_components` · `_data` · `_lib` 처럼 밑줄로 시작하는 폴더는 URL 이 되지 않는다.
  화면에 딸린 파일을 그 화면 폴더 안에 모아 두는 데 쓴다.
- `layout.tsx` 는 자식 화면이 바뀌어도 **다시 그려지지 않는다.** 그래서 기기 목업 ·
  상태바 · 탭바 · 알래봇 · 토스트가 화면을 넘나들며 그대로 남는다(`ShowcaseLayout`).

React Router 로 치면 `<Routes>` 를 손으로 적는 대신 폴더를 만드는 것이다.

### 2-2. 서버 컴포넌트와 클라이언트 컴포넌트

Next 의 컴포넌트는 기본이 **서버 컴포넌트**다 — 서버에서 한 번 그려서 HTML 로
보내고, 브라우저에서는 다시 실행되지 않는다. `useState` · `useEffect` · `onClick`
· `window` 처럼 브라우저에서 살아 움직여야 하는 것은 파일 맨 위에 `"use client"`
를 적어 **클라이언트 컴포넌트**로 만들어야 한다.

이 프로젝트의 실제 분포:

- `src/app/**/page.tsx` 23개는 전부 서버 컴포넌트다 — `"use client"` 가 없다.
  하는 일은 `params` 를 풀어 클라이언트 컴포넌트 하나를 그리는 것뿐이다.
- 나머지를 합친 244개 파일 중 149개가 `"use client"` 다. 화면이 전부 눌리고 넘기고
  저장하는 것들이라 그렇다.

```tsx
// src/app/community/post/[postId]/page.tsx — 서버 컴포넌트
export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>;   // ← 이 버전에서는 Promise 다. await 로 푼다
}) {
  const { postId } = await params;
  return <PostDetailLoader postId={postId} />;   // ← 여기부터 "use client"
}
```

경계 규칙 두 가지:

1. 서버 컴포넌트는 클라이언트 컴포넌트를 그릴 수 있지만, 그 반대(클라이언트가
   서버 컴포넌트를 import)는 안 된다. 그래서 `layout.tsx`(서버)가 `ShowcaseLayout`
   (클라이언트)에 `children` 을 넘기는 구조다.
2. 서버에서 그린 HTML 과 브라우저가 처음 그린 결과가 **다르면 hydration 오류**다.
   퍼소나 · 코인 · 장바구니처럼 브라우저에만 있는 값은 `useSyncExternalStore` 의
   `getServerSnapshot` 으로 「서버는 이렇게 그려라」를 따로 준다 — `src/state/*` 의
   스토어가 전부 이 모양이다.

### 2-3. 빌드 때 미리 만드는 화면 — `generateStaticParams`

동적 세그먼트가 있는 화면 6개(`post/[postId]` · `knowledge/[id]` · `chat/[roomId]`
· `debate/[debateId]` · `category/[field]` 등)는 `generateStaticParams` 로 「어떤
값이 있는지」를 알려 준다. 전 구간 mock 이라 값이 데이터 파일에 다 있고, Next 가
`next build` 때 그 주소들을 정적 HTML 로 미리 만들어 둔다.

```tsx
export function generateStaticParams() {
  return recent.posts.map((post) => ({ postId: post.id }));
}
```

### 2-4. 서버 함수 — Route Handler

`src/app/api/ai/route.ts` 는 화면이 아니라 **서버에서 도는 함수**다. `export async
function POST(request: Request)` 를 내보내면 `POST /api/ai` 가 된다. 알래봇이 여기로
묻고, 여기서만 Anthropic 에 붙는다.

이것이 이 프로젝트가 Next 고유 기능을 쓰는 **유일한 곳**이고, Next 를 두기로 한
실질적 이유다 — API 열쇠(`ANTHROPIC_API_KEY`)를 브라우저에 내보내지 않고 서버에서만
읽을 수 있다. 열쇠는 `.env.local` 에 두고 `.gitignore` 가 `.env*` 를 막는다.
`NEXT_PUBLIC_` 접두사가 붙은 환경변수만 브라우저로 나간다 — 열쇠에는 절대 붙이지
않는다.

### 2-5. Next 가 주는 부품

| 쓰는 것 | 어디서 | 하는 일 |
|---|---|---|
| `next/link` (`<Link>`) | 24 파일 | 전체 새로고침 없이 화면을 바꾼다. 스토어(코인 · 장바구니)가 살아남는 이유 |
| `next/navigation` | 43 파일 | `useRouter`(push · replace · back), `usePathname`(지금 주소 — 탭바 활성 · 알래봇 위치), `notFound()` |
| `next/font/google` | `layout.tsx` | Pacifico 를 빌드 때 받아 self-host 한다. 영수증 글꼴 넷은 한글 조각이 안 와서 `<link>` 로 직접 받는다 |
| `metadata` · `viewport` export | `layout.tsx` | `<title>` · 설명 · 테마색 · viewport-fit. 파일에서 내보내면 Next 가 `<head>` 에 넣는다 |
| `manifest.ts` · `icon.png` · `apple-icon.png` · `favicon.ico` | `src/app/` | 파일 이름 규칙만 맞추면 PWA 매니페스트와 아이콘이 붙는다 |
| `public/` | `public/assets/**` | 그대로 서빙되는 정적 파일. `/assets/home/ai.svg` 가 곧 주소 |
| `@/*` 경로 별칭 | `tsconfig.json` | `@/components/...` = `src/components/...` |
| `eslint-config-next` | `eslint.config.mjs` | Next 규칙 + React 훅 규칙(`react-hooks/set-state-in-effect` 등) |

`next/image` 는 **안 쓴다.** Figma 에서 받은 SVG 를 최적화하지 않으려 하고, 크기가
제각각인 그림을 프레임 좌표대로 놓아야 해서 `components/common/Img.tsx` 가 그냥
`<img>` 를 감싼다.

### 2-6. 그 밖에

- `next.config.ts` 는 비어 있다 — 기본값으로 충분하다.
- Tailwind v4 는 Next 가 아니라 PostCSS 플러그인(`@tailwindcss/postcss`)으로 붙는다.
  `src/styles/globals.css` 의 `@theme` 이 색 · 간격 토큰이다.
- `.next/` 는 빌드 산출물이라 커밋하지 않는다.

---

## 3. 실행 · 빌드 · 배포

```bash
npm.cmd run dev        # next dev  — http://localhost:3000, 저장하면 바로 반영(Fast Refresh)
npx.cmd tsc --noEmit   # 타입만 검사
npm.cmd run lint       # eslint
npm.cmd run build      # next build — .next/ 에 결과. 배포 전 이걸로 깨지는지 본다
npm.cmd run start      # 빌드한 것을 서버로 띄워 본다
```

PowerShell 에서는 `npm` 이 막혀 있어 `npm.cmd` 다.

배포는 `main` 에 푸시하면 Vercel(`rmb_test`)이 `next build` 를 돌려 올린다. 설정
파일이 없어도 Vercel 이 `package.json` 을 보고 Next 임을 안다. Route Handler
(`/api/ai`)는 서버리스 함수로 뜨고, 환경변수 `ANTHROPIC_API_KEY` 는 Vercel 프로젝트
설정에 따로 넣어야 배포본에서도 알래봇이 답한다.

---

## 4. 이 버전은 「아는 Next」와 다르다

`package.json` 의 Next 는 **16.3.4** 다. `AGENTS.md`(`next dev` 가 자동으로 쓴다)가
경고하듯, 학습 데이터 · 블로그 · 옛 튜토리얼과 API 가 다른 데가 있다. 확실하지
않으면 **이 저장소에 딸린 문서**를 본다:

```
node_modules/next/dist/docs/01-app/01-getting-started/
├─ 02-project-structure.md         폴더 규칙 (page · layout · _폴더 · [세그먼트])
├─ 03-layouts-and-pages.md
├─ 04-linking-and-navigating.md
├─ 05-server-and-client-components.md
├─ 13-fonts.md
├─ 14-metadata-and-og-images.md
└─ 15-route-handlers.md
```

이 프로젝트에서 실제로 부딪힌 차이:

- `params` 가 객체가 아니라 **Promise** 다 — `await params` 로 푼다(2-2 예).
- 효과 안에서 `setState` 하면 `react-hooks/set-state-in-effect` 규칙에 걸린다.
  스토어 값은 `useSyncExternalStore` 로 읽고, 다시 그려야 하는 것은 `key` 로 통째로
  갈아 끼운다(온보딩의 `run`).
- `<link rel="stylesheet">` 를 `<html>` 바로 밑에 두면 브라우저가 옮겨 놓아 hydration
  이 어긋난다 — `<head>` 안에 둔다(`layout.tsx` 주석).

---

## 5. 자주 헷갈리는 것

**"use client" 를 어디에 붙이나** — 훅 · 이벤트 · `window` 를 쓰는 파일에. 붙인
파일이 import 하는 것은 전부 클라이언트로 딸려간다. `page.tsx` 에는 붙이지 않고
그 안에서 그리는 컴포넌트에 붙이는 것이 이 프로젝트의 관례다.

**새로고침하면 상태가 사라진다** — 스토어들이 「이 판(page load)에만 산다」로
설계되어 있어서다(시연을 매번 처음부터). `<Link>` · `router.push` 로 움직이면
남고, 주소창에 직접 치거나 F5 를 누르면 사라진다. 퍼소나와 온보딩 여부만
`sessionStorage` 에 남긴다.

**서버 컴포넌트에서 훅을 썼다는 오류** — `useState is not a function` 류. 그 파일
(또는 그 파일을 import 한 위쪽)에 `"use client"` 가 없다.

**`window is not defined`** — 서버에서도 그 코드가 돈다는 뜻. `useEffect` 안이나
`typeof window !== "undefined"` 뒤로 옮긴다(`coinStore.ts` 의 `follow()` 참고).

**hydration mismatch 경고** — 서버가 그린 것과 브라우저 첫 그림이 다르다.
브라우저에만 있는 값(스토리지 · 시각 · 랜덤)을 첫 렌더에서 읽고 있다.
`getServerSnapshot` 을 준다.

**`/api/ai` 가 로컬에서 「연결되지 않았다」** — `.env.local` 에 열쇠가 없다. 파일을
만들면 개발 서버를 다시 띄운다.

---

## 6. 요구사항 7-1 과의 관계

7-1 은 「기본 기술은 React + TypeScript + Vite」이고, 「기존에 작동하는 구조가
있으면 그 방식을 우선 유지한다. Next.js · SSR 로 전환하지 않는다」고 적고 있다.
이 저장소는 2026-09-04 에 Next 로 처음 만들어졌고(요구사항 문서는 09-08 에
들어왔다), 그 뒤로는 7-1 의 「작동하는 구조 유지」 쪽을 따랐다. 폴더 이름은 7-2
(components · hooks · state · data · types · utils)를 따른다.

---

## 7. Next 를 옮기지 않은 이유 — 그리고 설명하는 법

2026-09-15 에 Vite 로 옮기지 않기로 했다. 옮기려면 라우팅(`app/**` → `<Routes>`) ·
`next/link` · `next/navigation` 교체 · `/api/ai` 를 서버리스 함수로 분리 · `vercel.json`
SPA rewrite 가 필요하고, 이미 Vercel 에 배포되어 돌아가는 것을 뒤집는 값어치가
없다고 봤다.

누가 「왜 Next 인가」를 물으면 이렇게 답할 수 있다:

- 화면은 전부 클라이언트 컴포넌트다 — SSR 이 필요해서 고른 것이 아니다.
- 필요했던 것은 **API 열쇠를 숨길 서버 한 곳**(`/api/ai`)이고, Next 는 그것을 같은
  저장소 · 같은 배포로 준다. Vite 였으면 서버리스 함수를 따로 두었을 것이다.
- 파일 기반 라우팅과 `layout.tsx` 덕에 기기 목업 · 탭바 · 알래봇 같은 공통 틀이
  화면 전환에 살아남는다 — React Router 로도 되지만 손이 더 간다.
- 대가는 「알아야 할 규칙」이다. 서버/클라이언트 경계, hydration, 버전마다 바뀌는
  API — 4장과 5장이 그 비용의 목록이다.

---

## 8. 더 읽을 것

- `node_modules/next/dist/docs/01-app/` — 이 버전의 공식 문서. 웹의 문서보다 이것이 맞다.
- `src/app/layout.tsx` — 서버 컴포넌트 · 메타데이터 · 글꼴이 한 파일에 다 있다.
- `src/app/api/ai/route.ts` — Route Handler 한 편. 주석이 설계 이유를 다 적고 있다.
- `src/state/coinStore.ts` — `useSyncExternalStore` 스토어의 표준형. 다른 스토어가 이 모양을 따른다.
