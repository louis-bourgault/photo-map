import { redirect, error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { project, photo, story } from '$lib/server/db/schema';
import { auth } from '$lib/server/auth';
import { eq } from 'drizzle-orm';
import type { Photo } from '$lib/mapstore.svelte.js';
import { createPresignedDownloadURL } from '$lib/server/s3';

async function getPhotoInfo(photo: any, projectID: string): Promise<Photo> {
	//the original photo is as stored in the database, could possibly define this later (not as any)
	const url = await createPresignedDownloadURL(`photos/${projectID}/${photo.filename}/thumb`);
	return {
		id: photo.id,
		filename: photo.filename,
		exif: photo.exif,
		latitude: photo.latitude,
		longitude: photo.longitude,
		thumbnailUrl: url,
		fullsizeUrl: null
	};
}

export const load: LayoutServerLoad = async (event) => {
	const [projectDetails, storyDetails, photos] = await Promise.all([
		db.select().from(project).where(eq(project.id, event.params.slug)).execute(),
		db.select().from(story).where(eq(story.projectID, event.params.slug)).execute(),
		db.select().from(photo).where(eq(photo.projectID, event.params.slug)).execute()
	]);

	if (projectDetails.length === 0) {
		throw error(404, 'Project not found');
	}
	const promises = photos.map((photo) => getPhotoInfo(photo, event.params.slug));
	const processedPhotos: Photo[] = await Promise.all(promises);

	return {
		user: event.locals.user,
		project: projectDetails[0],
		processedPhotos,
		stories: storyDetails
	};
};
