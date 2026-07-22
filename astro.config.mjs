// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// 배포 도메인이 정해지면 여기를 실제 주소로 바꾼다 (RSS·sitemap·canonical에 쓰임).
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
});
