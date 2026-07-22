#!/usr/bin/env node
// 줄거리 → Claude가 수필체로 각색 → 초안 .md 생성 (draft:true, 로컬 전용).
//
// 사용법:  node scripts/generate.mjs [줄거리파일]
//   줄거리파일 생략 시 outline.txt 를 읽는다.
//
// 정책(CLAUDE.md):
//   - API 키는 ANTHROPIC_API_KEY 환경변수에서만 읽는다. 코드/커밋에 넣지 않는다.
//   - 항상 draft:true 로만 생성한다. 자동 발행하지 않는다 — 사람이 읽고 공개한다.
//   - frontmatter 는 모델이 아니라 이 스크립트가 만든다(형식/draft 보장).

import Anthropic from '@anthropic-ai/sdk';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const MODEL = 'claude-opus-4-8';
const OUT_DIR = 'src/content/blog';

// 모델이 프론트매터를 못 건드리게, 제목/슬러그/본문만 JSON으로 받는다.
const SYSTEM = `너는 한국어 수필가다. 주어진 줄거리를 담담하고 서정적인 수필체로 각색한다.
규칙:
- 줄거리의 사실을 왜곡하거나 없는 사건을 지어내지 않는다.
- 실명·연락처·계약 등 개인정보는 글에 넣지 않는다.
- 마크다운 본문만 쓴다. frontmatter(---)는 절대 쓰지 않는다.
반드시 아래 JSON 형식으로만 답한다:
{"title": "글 제목", "slug": "kebab-case-영문슬러그", "body": "마크다운 본문"}`;

function slugToday() {
	// 파일 충돌 방지용 접미사. Date.now 대신 현지 시각 문자열.
	return new Date().toISOString().slice(0, 10);
}

function frontmatter({ title, description }) {
	const esc = (s) => String(s).replace(/"/g, '\\"');
	return [
		'---',
		`title: "${esc(title)}"`,
		`description: "${esc(description ?? '')}"`,
		`pubDate: ${slugToday()}`,
		'draft: true',
		'---',
		'',
	].join('\n');
}

// frontmatter 자체 점검: 필수 필드가 다 있고 draft:true 인지. 깨지면 실패.
function assertValidFrontmatter(md) {
	const m = md.match(/^---\n([\s\S]*?)\n---/);
	if (!m) throw new Error('frontmatter 블록이 없습니다');
	const fm = m[1];
	for (const key of ['title', 'pubDate', 'draft']) {
		if (!new RegExp(`^${key}:`, 'm').test(fm)) throw new Error(`frontmatter에 ${key} 없음`);
	}
	if (!/^draft:\s*true\s*$/m.test(fm)) throw new Error('draft:true 가 아닙니다 (자동 발행 금지)');
}

async function main() {
	if (!process.env.ANTHROPIC_API_KEY) {
		console.error('ANTHROPIC_API_KEY 환경변수가 없습니다. `export ANTHROPIC_API_KEY=...` 후 다시 실행하세요.');
		process.exit(1);
	}

	const outlinePath = process.argv[2] ?? 'outline.txt';
	if (!existsSync(outlinePath)) {
		console.error(`줄거리 파일을 찾을 수 없습니다: ${outlinePath}`);
		process.exit(1);
	}
	const outline = (await readFile(outlinePath, 'utf8')).trim();
	if (!outline) {
		console.error(`줄거리 파일이 비어 있습니다: ${outlinePath}`);
		process.exit(1);
	}

	const client = new Anthropic(); // 키는 SDK가 ANTHROPIC_API_KEY에서 자동으로 읽는다
	const res = await client.messages.create({
		model: MODEL,
		max_tokens: 4096,
		system: SYSTEM,
		messages: [{ role: 'user', content: `다음 줄거리를 수필로 각색해줘:\n\n${outline}` }],
	});

	const text = res.content.find((b) => b.type === 'text')?.text ?? '';
	let parsed;
	try {
		parsed = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] ?? text);
	} catch {
		console.error('모델 응답을 JSON으로 파싱하지 못했습니다:\n', text);
		process.exit(1);
	}

	const md = frontmatter({ title: parsed.title, description: '' }) + parsed.body.trim() + '\n';
	assertValidFrontmatter(md);

	await mkdir(OUT_DIR, { recursive: true });
	const slug = (parsed.slug || 'essay').replace(/[^a-z0-9-]/gi, '-').toLowerCase();
	const file = `${OUT_DIR}/${slug}-${slugToday()}.md`;
	await writeFile(file, md, { flag: 'wx' }); // 기존 파일 덮어쓰지 않음

	console.log(`초안 생성: ${file}`);
	console.log('draft:true 상태입니다. 읽고 수정한 뒤 draft를 false로 바꿔야 공개됩니다.');
}

// self-check: node scripts/generate.mjs --selftest  (API 호출 없음)
if (process.argv.includes('--selftest')) {
	const good = frontmatter({ title: '제목 "따옴표"', description: '' }) + '본문\n';
	assertValidFrontmatter(good);
	let threw = false;
	try {
		assertValidFrontmatter('---\ntitle: x\npubDate: 2026-01-01\ndraft: false\n---\n');
	} catch {
		threw = true;
	}
	if (!threw) throw new Error('draft:false 를 걸러내지 못함');
	console.log('selftest 통과');
} else {
	main();
}
