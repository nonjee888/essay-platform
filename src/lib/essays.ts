import { getCollection } from 'astro:content';

// 공개 대상 글만, 최신순으로. draft:true 글은 프로덕션 빌드에서 제외되어
// 배포 사이트에 절대 노출되지 않는다(자동 발행 금지). dev에서는 미리보기용으로 보인다.
// ponytail: 목록·본문·RSS가 전부 이 함수를 거치게 해서 draft 누락을 한 곳에서 막는다.
export async function getPublishedEssays() {
	const essays = await getCollection('blog', ({ data }) =>
		import.meta.env.PROD ? !data.draft : true,
	);
	return essays.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
