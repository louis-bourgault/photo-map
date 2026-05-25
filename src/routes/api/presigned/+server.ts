import { json } from '@sveltejs/kit';
import { createPresignedDownloadURL } from '$lib/server/s3';

export async function POST({ request, url}) {
	const size = url.searchParams.get('res') === 'full' ? 'full' : 'thumb';
	const { projectID, filename } = await request.json();

	if (size === 'thumb') {
		const thumbUrl = await createPresignedDownloadURL(`photos/${projectID}/${filename}/thumb`);
		return json({ url: thumbUrl });
	} else {
		const fullsizeUrl = await createPresignedDownloadURL(`photos/${projectID}/${filename}/full`);
		return json({ url: fullsizeUrl });
	}
}
