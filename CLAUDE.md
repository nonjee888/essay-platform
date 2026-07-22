# 묵혀둔 이야기 — 수필 연재 플랫폼

내가 준 줄거리를 AI가 수필체로 각색해 정적 사이트에 올린다. 저자는 익명.
스택: Astro + 마크다운. 배포: Vercel/Netlify (git push 자동 배포).

## 보안·안전 정책 (반드시 준수)

- API 키·비밀번호·토큰을 코드나 커밋 파일에 절대 넣지 않는다.
  키는 오직 사용자 환경변수 `ANTHROPIC_API_KEY`에서만 읽는다. `.env`는 `.gitignore`에 있다.
- AI가 생성한 글은 **자동 발행하지 않는다.** 항상 `draft: true`로 만들고,
  사람이 읽고 직접 `draft`를 `false`로 바꿔야 공개된다.
- 실제 발행·배포(git push, 도메인 연결 등)는 사용자 허락을 받고 진행한다.
- 고객명·계약 정보·개인정보 등 민감 데이터는 글이나 저장소에 넣지 않는다.

## 콘텐츠 규칙

- 글 1편 = `src/content/blog/*.md` 파일 1개.
- frontmatter: `title`(필수), `pubDate`(필수), `draft`(기본 false), `description`(선택), `heroImage`(선택).
- `draft: true` 글은 프로덕션 빌드/배포에서 제외된다. dev 서버(`npm run dev`)에서는 미리보기로 보인다.
- 공개 대상 글은 항상 `src/lib/essays.ts`의 `getPublishedEssays()`를 거쳐 목록·본문·RSS에 노출된다.
- 사진은 `src/assets/`나 글 옆에 두고 마크다운에서 참조한다 (업로드 서버 없음).

## AI 생성

- `node scripts/generate.mjs [줄거리파일]` — 줄거리(기본 `outline.txt`)를 받아 초안 `.md`를 만든다 (`draft:true`).
- 모델은 최신 Claude(`claude-opus-4-8`)를 쓴다. frontmatter는 스크립트가 직접 만든다.
- 생성 후 반드시 사람이 검토한다. 각색은 원 줄거리의 사실을 왜곡하지 않는다.
- 로직 점검: `node scripts/generate.mjs --selftest` (API 호출 없음).

## 작업 방식

- 새 기능·구조 변경 전에는 먼저 설계를 확인받는다.
- 불필요한 의존성·추상화를 더하지 않는다. Astro 기본 기능을 먼저 쓴다.
- v2로 미룬 것: 메일 알림, 카카오 알림, 연재물(series)·태그 페이지, 댓글(Giscus). 필요해지면 추가.
