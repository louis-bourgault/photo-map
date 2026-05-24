import { json } from '@sveltejs/kit';
import { createPresignedDownloadURL } from '$lib/server/s3';

export async function POST({ request }) {
    const { projectID, filename } = await request.json();
    const fullsizeUrl = await createPresignedDownloadURL(`photos/${projectID}/${filename}/full`);

    return json({ fullsizeUrl });
}   