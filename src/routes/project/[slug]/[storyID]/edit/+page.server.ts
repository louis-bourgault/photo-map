import { db } from '$lib/server/db';
import { project, story, storyItem } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const [rows, projectInfo] = await Promise.all([
		db
			.select({
				storyId: story.id,
				storyProjectId: story.projectID,
				storyTitle: story.title,
				storySlug: story.slug,
				itemId: storyItem.id,
				itemPhoto: storyItem.photo,
				itemPhotoCaption: storyItem.photoCaption,
				itemMarkdownContent: storyItem.markdownContent,
				itemIndexInStory: storyItem.indexInStory,
				itemType: storyItem.itemType
			})
			.from(story)
			.leftJoin(storyItem, eq(storyItem.story, story.id))
			.where(eq(story.slug, params.storyID))
			.orderBy(storyItem.indexInStory)
			.execute(),
		db.select().from(project).where(eq(project.id, params.slug))
	]);

	if (projectInfo.length === 0) {
		throw error(404, 'Project not found');
	}

	if (projectInfo[0].userID !== locals.user.id) {
		throw error(403, 'Forbidden');
	}

	if (rows.length === 0) {
		throw error(404, 'Story not found');
	}

	const storyDetails = {
		id: rows[0].storyId,
		projectID: rows[0].storyProjectId,
		title: rows[0].storyTitle,
		slug: rows[0].storySlug
	};

	const storyBlocks = rows
		.filter((row) => row.itemId !== null)
		.map((row) => ({
			id: row.itemId!,
			story: row.storyId,
			photo: row.itemPhoto,
			photoCaption: row.itemPhotoCaption,
			markdownContent: row.itemMarkdownContent,
			indexInStory: row.itemIndexInStory!,
			itemType: row.itemType! as 'photo' | 'text'
		}));

	return { storyDetails, storyBlocks };
}
