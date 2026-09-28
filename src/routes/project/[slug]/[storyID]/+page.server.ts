import { db } from '$lib/server/db';
import { photo, story, storyItem } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { createPresignedDownloadURL } from '$lib/server/s3';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';
import { toClientPhoto } from '$lib/server/photos';

export async function load({ params }) {
	const rows = await db
		.select()
		.from(story)
		.leftJoin(storyItem, eq(storyItem.story, story.id))
		.leftJoin(photo, eq(storyItem.photo, photo.id))
		.where(and(eq(story.slug, params.storyID), eq(story.projectID, params.slug)))
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
			photo: row.photo,
			safeHtml:
				row.story_item?.itemType === 'text' && row.story_item.markdownContent
					? sanitizeHtml(marked.parse(row.story_item.markdownContent) as string, {
							allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'img']),
							allowedAttributes: {
								...sanitizeHtml.defaults.allowedAttributes,
								img: ['src', 'alt']
							},
							allowedSchemes: ['http', 'https', 'mailto']
						})
					: null
		}));

	const photoProms = storyBlocks
		.filter((block) => block.story_item.itemType === 'photo' && block.photo)
		.map(async (block) => {
			const fullURL = await createPresignedDownloadURL(
				`photos/${params.slug}/${block.photo!.filename}/full`
			);
			return {
				id: block.photo!.id,
				fullSizeURL: fullURL
			};
		});

	const photoPresigned = await Promise.all(photoProms);
	const processedPhotos = Array.from(
		new Map(
			storyBlocks
				.filter((block) => block.photo)
				.map((block) => [block.photo!.id, toClientPhoto(block.photo!, params.slug)])
		).values()
	);

	return { storyDetails, storyBlocks, photoPresigned, processedPhotos };
}
