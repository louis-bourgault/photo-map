import { db } from '$lib/server/db';
import { photo, story, storyItem } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { createPresignedDownloadURL } from '$lib/server/s3';

export async function load({ params }) {
	const rows = await db
		.select()
		.from(story)
		.leftJoin(storyItem, eq(storyItem.story, story.id))
		.leftJoin(photo, eq(storyItem.photo, photo.id))
		.where(eq(story.slug, params.storyID))
		.orderBy(storyItem.indexInStory)
		.execute();

	if (rows.length === 0) {
		throw error(404, 'Story not found');
	}
	const storyDetails = rows[0].story;


	const storyBlocks = rows
		.filter((row) => row.story_item !== null)
		.map((row) => ({
			story_item: row.story_item!,
			photo: row.photo
		}));

	const photoProms = storyBlocks
		.filter((block) => block.story_item.itemType === 'photo' && block.photo)
		.map(async (block) => {
			const fullURL = await createPresignedDownloadURL(`photos/${params.slug}/${block.photo!.filename}/full`);
			return {
				id: block.photo!.id,
				fullSizeURL: fullURL
			};
		});

	const photoPresigned = await Promise.all(photoProms);

	return { storyDetails, storyBlocks, photoPresigned };
}