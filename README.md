# 묵혀둔 이야기

> 오래 삭여 두었던 글을 하나씩 꺼냅니다.

줄거리를 Claude Code가 수필체로 각색해 올리는, 익명 수필 블로그.
Astro 정적 사이트라 서버·DB·로그인이 없다.

## 글 쓰는 흐름

```
줄거리 → Claude Code가 draft:true 초안(.md) 작성 → 내가 읽고 수정 → draft:false → git push → 자동 배포
```

AI가 만든 글은 **자동 발행되지 않는다.** `draft: true` 글은 배포 사이트에서 제외되고,
사람이 직접 `draft`를 `false`로 바꿔야 공개된다.

## 글 한 편 = 파일 하나

`src/content/blog/<slug>.md`. frontmatter:

| 필드 | 필수 | 설명 |
| :--- | :--: | :--- |
| `title` | ✓ | 제목 |
| `pubDate` | ✓ | 발행일 (`2026-07-22`) |
| `draft` | · | `true`면 비공개 (기본 `false`) |
| `description` | · | 목록·RSS·SEO용 한 줄 설명 |
| `heroImage` | · | 대표 사진 (`src/assets/`에 두고 참조) |

목록·본문·RSS는 모두 [`src/lib/essays.ts`](src/lib/essays.ts)의 `getPublishedEssays()`를 거친다 —
draft 누락을 한 곳에서 막는다.

## 명령어

| 명령 | 동작 |
| :--- | :--- |
| `npm install` | 의존성 설치 |
| `npm run dev` | 로컬 서버 `localhost:4321` (draft도 미리보기됨) |
| `npm run build` | `./dist/`로 프로덕션 빌드 (draft 제외) |
| `npm run preview` | 빌드 결과 미리보기 |

## 배포

Vercel/Netlify에 이 리포를 연결하면 `git push` 시 자동 배포된다.
배포 도메인이 정해지면 [`astro.config.mjs`](astro.config.mjs)의 `site`를 실제 주소로 바꾼다
(RSS·sitemap·canonical URL에 쓰임).

## 규칙

작업 규칙과 안전 정책은 [`CLAUDE.md`](CLAUDE.md) 참고.
