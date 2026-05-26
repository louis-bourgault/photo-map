import { db } from '$lib/server/db';
import { project, photo, story, storyItem } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { createPresignedDownloadURL } from '$lib/server/s3';

export async function load({ params, locals }) {
	const storyDetails = await db
		.select()
		.from(story)
		.where(eq(story.slug, params.storyID))
		.execute();
	if (storyDetails.length === 0) {
		error(404, 'Story not found');
	}
	let storyBlocks = await db
		.select()
		.from(storyItem)
		.where(eq(storyItem.story, storyDetails[0].id))
		.orderBy(storyItem.indexInStory)
		.leftJoin(photo, eq(storyItem.photo, photo.id))
		.execute();
    
	return { storyDetails: storyDetails[0], storyBlocks };
}


