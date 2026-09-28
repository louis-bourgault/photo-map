import { db } from '$lib/server/db';
import { photo, project, story, storyItem } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { toClientPhoto } from '$lib/server/photos';

export async function load({ params, locals }) {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const [rows, projectInfo, photoRows] = await Promise.all([
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
			.where(and(eq(story.slug, params.storyID), eq(story.projectID, params.slug)))
			.orderBy(storyItem.indexInStory)
			.execute(),
		db.select().from(project).where(eq(project.id, params.slug)),
		db
			.select({
				id: photo.id,
				filename: photo.filename,
				latitude: photo.latitude,
				longitude: photo.longitude
			})
			.from(photo)
			.where(eq(photo.projectID, params.slug))
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

	return {
		storyDetails,
		storyBlocks,
		processedPhotos: photoRows.map((row) => toClientPhoto(row, params.slug))
	};
}
