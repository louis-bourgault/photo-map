import { db } from '$lib/server/db';
import { and, eq, inArray } from 'drizzle-orm';
import { story, storyItem, project, photo } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';

type StoryBlockPayload = {
	id: string;
	story: string;
	photo: number | null;
	photoCaption: string | null;
	markdownContent: string | null;
	indexInStory: number;
	itemType: 'photo' | 'text';
};

export async function POST({ request, params, locals }) {
	if (!locals.user) error(401, 'Unauthorized');
	const { storyBlocks } = (await request.json()) as { storyBlocks: StoryBlockPayload[] };
	if (!params.storyID) {
		error(400, 'Story ID is required');
	}
	const [storyInfo, projectInfo] = await Promise.all([
		db
			.select()
			.from(story)
			.where(and(eq(story.slug, params.storyID), eq(story.projectID, params.slug)))
			.then((res) => res[0]),
		db
			.select()
			.from(project)
			.where(eq(project.id, params.slug))
			.then((res) => res[0])
	]);

	if (!storyInfo) {
		error(404, 'Story not found');
	}

	if (!projectInfo) {
		error(404, 'Project not found');
	}

	if (projectInfo.userID !== locals.user.id || storyInfo.projectID !== projectInfo.id) {
		error(403, 'Forbidden');
	}

	const normalizedBlocks = storyBlocks.map((block, index) => ({
		...block,
		story: storyInfo.id,
		indexInStory: index,
		itemType: block.itemType === 'photo' ? 'photo' : 'text'
	}));
	const requestedPhotoIds = normalizedBlocks
		.map((block) => block.photo)
		.filter((id): id is number => id !== null);
	if (requestedPhotoIds.length > 0) {
		const validPhotos = await db
			.select({ id: photo.id })
			.from(photo)
			.where(and(eq(photo.projectID, projectInfo.id), inArray(photo.id, requestedPhotoIds)));
		if (new Set(validPhotos.map((row) => row.id)).size !== new Set(requestedPhotoIds).size) {
			error(400, 'A story photo does not belong to this project');
		}
	}

	const oldData = await db.select().from(storyItem).where(eq(storyItem.story, storyInfo.id));
	const oldIds = new Set(oldData.map((block) => block.id));
	const newIds = new Set(normalizedBlocks.map((block) => block.id));
	const idsToDelete = oldData.filter((block) => !newIds.has(block.id)).map((block) => block.id);

	await db.transaction(async (tx) => {
		if (idsToDelete.length > 0) {
			await tx.delete(storyItem).where(inArray(storyItem.id, idsToDelete));
		}
		await Promise.all(
			normalizedBlocks.map((block) => {
				if (oldIds.has(block.id)) {
					return tx
						.update(storyItem)
						.set({
							story: block.story,
							photo: block.photo,
							photoCaption: block.photoCaption,
							markdownContent: block.markdownContent,
							indexInStory: block.indexInStory,
							itemType: block.itemType
						})
						.where(eq(storyItem.id, block.id));
				}
				return tx.insert(storyItem).values({
					id: block.id,
					story: block.story,
					photo: block.photo,
					photoCaption: block.photoCaption,
					markdownContent: block.markdownContent,
					indexInStory: block.indexInStory,
					itemType: block.itemType
				});
			})
		);
	});

	return new Response(JSON.stringify({ message: 'Story saved successfully!' }), { status: 200 });
}
