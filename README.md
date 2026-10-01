# 알래말래븐 — 지식 편의점

3조 "안쉬었음청년" MVP. Figma 디자인을 Next.js로 옮긴 프로젝트입니다..

- **디자인 원본**: [Figma — 3조 안쉬었음청년](https://www.figma.com/design/qgUUY7bAsKYv5QTg8QijKl/3%EC%A1%B0-%EC%95%88%EC%89%AC%EC%97%88%EC%9D%8C%EC%B2%AD%EB%85%84---%EB%94%94%EC%9E%90%EC%9D%B8)
- **스택**: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4

## 실행

```bash
npm install
npm run dev
```

http://localhost:3000 에서 확인하세요. 디자인이 402×874 모바일 프레임 기준이라,
브라우저 개발자도구의 모바일 뷰(iPhone 16 / 402×874)로 보면 가장 정확합니다.

## 알래봇(AI) 연결

떠 있는 초록 단추로 들어가는 `/ai` 화면은 Claude 에게 물어 답합니다.
열쇠가 없어도 앱은 그대로 돌아가고, 알래봇만 「아직 연결되지 않았어요」라고
답합니다.

붙이려면 프로젝트 뿌리에 `.env.local` 을 만들고 한 줄 넣으세요

```
ANTHROPIC_API_KEY=sk-ant-...
```

열쇠는 [Anthropic Console](https://console.anthropic.com/settings/keys) 에서
발급합니다. `.gitignore` 가 `.env*` 를 막고 있으니 커밋에 딸려 가지 않습니다.
넣은 뒤에는 `npm run dev` 를 다시 띄워야 읽습니다.

열쇠는 서버(`src/app/api/ai/route.ts`)에서만 읽습니다 — 화면은 `/api/ai` 로
물어보기만 하므로 브라우저에 열쇠가 나가지 않습니다. `NEXT_PUBLIC_` 을 붙여
두면 그대로 새어 나가니 쓰지 마세요.

쓰는 모델은 `claude-opus-5` 이고, 대화 한 번에 최대 1024 토큰까지 받습니다.
말투와 규칙(모르면 모른다고 답하기)은 같은 파일의 `SYSTEM` 에 적혀 있습니다.

## 화면

| 라우트 | 화면 | Figma 노드 |
| --- | --- | --- |
| `/onboarding` | 온보딩 (네 장) | `1272:3246` · `1182:1073` · `1219:3769` · `1251:3947` |
| `/` | 홈 | `559:8008` v6 |
| `/community` | 커뮤니티 · 게시글 | `564:5271` 게시글Home |
| `/community/write` | 커뮤니티 · 글쓰기 | `564:5704` 글쓰기 |

온보딩은 홈(`/`)에 닿을 때 저절로 뜬다. 다 보거나 Skip 하면 그 뒤로는 앱 안을
오가는 동안 다시 뜨지 않지만, **새로고침하면 처음부터 다시 나온다** — 브라우저에
남기지 않고 이 판(page load)에만 두기 때문이다. 주소로 `/onboarding` 에 들어가도
언제든 볼 수 있다.

자동으로 여는 것은 `FirstRun.tsx` 의 `AUTO_OPEN` 이 쥐고 있다. 다른 화면을 손보는
동안 홈이 매번 온보딩으로 튕겨 거치적거리면 이 한 줄만 `false` 로 둔다 — 그래도
`/onboarding` 으로 들어가는 길은 그대로다.

한 사람에게 평생 한 번만 보이려면 `src/state/onboardingStore.ts` 의 값을
`localStorage` 로 옮기면 된다.

첫 장은 이름만 띄우는 여는 화면이라 생김새가 아예 다르고(`Splash`), 1.6초 뒤
저절로 둘째 장으로 넘어간다 — 넘길 단추도 점도 없는 화면이다. 나머지 셋은 틀이
한 벌이라 `src/data/common/onboarding.ts` 의 `steps` 배열이 전부다. 아래 점도 그
길이를 따라간다.

가운데 그림은 디자이너가 준 Lottie 다. `.lottie` 는 zip 이라 그대로 못 읽으니,
풀어서 안에 든 애니메이션 JSON 을 `public/assets/onboarding/` 에 두고 그 주소를
`motion` 에 적는다. `motion` 이 없는 장은 그 자리가 빈 채로 남는다.

`.lottie` 안에 `images/` 가 함께 들어 있으면(도형이 아니라 그림을 쓴 것), 그림을
JSON 의 `assets[].p` 에 `data:image/png;base64,…` 로 심고 `e: 1` 로 바꿔 한 파일로
만든다. 그림을 따로 두면 JSON 안의 경로(`u`)와 실제 경로가 어긋나 조용히 안 뜬다 —
한 파일이면 그럴 일이 없다. 02 는 그렇게 만든 것이다(그림 3장, 21KB).

`speed` 는 장마다 정한다. 원본 길이가 제각각이라(01 은 4.53초, 02 는 3.99초) 그냥
두면 넘길 때마다 박자가 달라진다. 지금은 둘 다 3.77초쯤에서 한 바퀴를 돌도록
맞춰 두었다.

## 구조

```
src/
  app/
    layout.tsx        루트 레이아웃 · 폰트 · 402×874 프레임 · 상태바/탭바 고정
    globals.css       Tailwind v4 @theme 디자인 토큰
    page.tsx          홈 (Figma 559:8008)
    community/        커뮤니티 (Figma 564:5271)
  components/
    layout/           모든 화면이 공유하는 크롬 (상태바 · 하단 탭바 · 홈 인디케이터)
    home/             홈 화면 섹션
    community/        커뮤니티 화면 섹션
    ui/Img.tsx        /public 에셋용 <img> 래퍼
  data/
    home.ts           홈 목업 데이터
    community.ts      커뮤니티 목업 데이터
public/assets/        Figma에서 내보낸 아이콘 · 이미지
```

## 디자인 → 코드 매핑

### 홈 (`559:8008`)

| 컴포넌트 | Figma 노드 |
| --- | --- |
| `layout/StatusBar` | `559:8009` status_bar |
| `home/TopBar` | `559:8024` top_tit |
| `home/HeroSection` | `559:8044` section1 |
| `home/RecommendSection` | `559:8061` section2 |
| `home/QuizBox` | `559:8140` quiz_box |
| `home/PickBox` | `559:8167` pick_box |
| `home/FreeBox` | `559:8198` free_box |
| `home/LuckyDraw` | `559:8211` lucky_draw |
| `home/ContinueSection` | `559:8240` section3 |
| `layout/BottomNav` | `559:8282` 하단 탭바 |

### 커뮤니티 (`564:5271`)

| 컴포넌트 | Figma 노드 |
| --- | --- |
| `community/CommunityHeader` | `564:7085` Community Title |
| `community/CommunityTabs` | `564:5297` Top Tabs |
| `community/PollHero` | `564:5307` Hero Section |
| `community/CategoryChips` | `564:7274` Category Chips |
| `community/TrendingList` | `564:5336` Trending Knowledge |
| `community/RecentPosts` · `PostCard` | `564:5364` Recent Posts |
| `community/WriteFab` | `564:7202` FAB · 글쓰기 |

커뮤니티 프레임에도 자체 하단 탭바(`564:5480`)가 있지만 아이콘이 전부 placeholder라,
홈에서 쓰는 `layout/BottomNav`를 공유합니다.

앱 셸은 뷰포트 높이(`h-dvh`)를 채우고 가운데 콘텐츠만 스크롤합니다.
상태바 · 하단 탭바 · 홈 인디케이터 · 글쓰기 버튼은 항상 화면에 고정됩니다.

### 글쓰기 (`564:5704`)

| 컴포넌트 | Figma 노드 |
| --- | --- |
| `community/write/WriteHeader` | `607:921` 닫기 · 글쓰기 · 등록 |
| `community/write/WriteForm` | `564:5729` 스크롤 영역 (카테고리 · 제목 · 본문 · 출처) |
| `community/write/WritePhotos` | `564:5758` 사진 |
| `community/write/WriteOptions` | `564:5789` 추가 옵션 |
| `keyboard/IosKeyboard` | `634:1598` Keyboard / KR / iOS |

전체 화면 라우트라 하단 탭바와 홈 인디케이터를 숨깁니다 (`src/lib/routes.ts`).

**키보드** — 제목 · 본문 · 출처는 실제 `input` / `textarea`라 어디서든 타이핑됩니다.
휴대폰은 기기 키보드가 뜨고, 그게 없는 데스크톱에서는 `IosKeyboard`가 올라옵니다.
둘을 구분할 때 포인터 종류가 아니라 **visual viewport가 줄었는지**를 봅니다 —
크롬 개발자도구 모바일 뷰는 터치를 흉내 내지만 키보드는 안 띄우기 때문입니다.

화면 키보드는 자모만 보내므로 `src/lib/hangul.ts`의 2벌식 조합기가
ㅂ + ㅏ → 바, + ㄴ → 반처럼 음절로 합칩니다. 겹받침 · 복합모음 · 받침 이동
(닭 + ㅡ → 달그) · 백스페이스 단계별 해체까지 처리합니다.

PC에서 물리 키보드를 치면 해당 화면 키에 불이 들어옵니다. `event.code`(물리 위치)로
매핑하므로 OS가 한/영 어느 쪽이든 같은 키가 반응합니다. OS가 영문 모드면
자판 위치대로 조합해 한글을 넣고(q → ㅂ), 한글 IME가 켜져 있으면 IME에 맡기고
불만 켭니다. 입력 중인 칸은 키보드에 가리지 않도록 자동으로 밀어 올립니다.

### 작성한 글 저장

백엔드가 없어서 `src/lib/postStore.ts`가 localStorage에 담고 최신 글 맨 위에 끼워 넣습니다.
서버가 생기면 이 파일만 API 호출로 바꾸면 됩니다 — 화면은 `addPost`와 스토어 구독만 씁니다.

## 다음 작업

- `src/data/*.ts` 목업을 실제 API 응답으로 교체
- 아직 없는 화면: `/category`, `/record`, `/my`
- 커뮤니티 하위 화면: 채팅방(`564:5993`), 토론방(`564:5824`), 검색(`556:5226`), 나의 활동
- 글쓰기: 서버 저장(현재 localStorage), 카테고리 선택 화면, 영수증 불러오기, AI 퀴즈 생성
- 퀴즈 정답 채점 · 코인 적립 로직

### 디자인 코멘트 (Figma 주석에서 옮김)

- 전체적으로 카드가 너무 많음 — 정보 밀도 조정 검토
- 컬러 주황색으로 가지 않기 / 쓸 거면 서브로
- 퀴즈 박스가 설문 느낌 나지 않게 (내부 회의)
- `free_box`에 남은 시간 카운트다운 추가
- 랜덤 뽑기는 과자봉지 안 쁘띠씰 느낌으로
- 카드 일러스트: 입체적인 우유곽 / 분야별로 다른 모양 검토
