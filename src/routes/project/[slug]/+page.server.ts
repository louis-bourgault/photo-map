import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { project, photo, story } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';
import { createPresignedUploadURL } from '$lib/server/s3';
import { toClientPhoto } from '$lib/server/photos';

export const load: PageServerLoad = async (event) => {
	const rows = await db
		.select({
			id: photo.id,
			filename: photo.filename,
			latitude: photo.latitude,
			longitude: photo.longitude
		})
		.from(photo)
		.where(eq(photo.projectID, event.params.slug));
	return {
		user: event.locals.user,
		processedPhotos: rows.map((row) => toClientPhoto(row, event.params.slug))
	};
};

export const actions = {
	uploadFileURLs: async (event) => {
		if (!event.locals.user) return { error: 'Unauthorized', uploads: [] };
		//we're kind of using this not for its intended purpose. We do a hidden form on the client side which is used to send the exif data/lat/long, and then it returns presigned urls for the thumbnail and full size images.
		//the main reason for this is that i dont want to kill my vercel bandwidth billing.
		//there might be a problem with ghost entries that never actually get filled with photos. We might want a cron job or something that cleans that up, or a task queue that waits for a bit and then checks.
		const formData = await event.request.formData();
		const photosJson = formData.get('photos') as string | null;
		const projectID = event.params.slug;
		if (!photosJson) {
			return { uploads: [] };
		}

		const projectInfo = await db
			.select()
			.from(project)
			.where(eq(project.id, projectID))
			.then((res) => res[0]);
		if (!projectInfo) {
			return { uploads: [] };
		}
		if (projectInfo.userID !== event.locals.user.id) {
			return { uploads: [] };
		}

		const photoPayloads = JSON.parse(photosJson) as Array<{
			clientIndex: number;
			exif: string;
			latitude: string;
			longitude: string;
			filename: string;
		}>;
		if (!Array.isArray(photoPayloads) || photoPayloads.length > 100) {
			return { error: 'Upload between 1 and 100 photos at a time', uploads: [] };
		}

		const prepared = photoPayloads.map((payload) => {
			const extension = payload.filename.match(/\.[a-zA-Z0-9]{1,10}$/)?.[0]?.toLowerCase() ?? '';
			return { payload, storageName: `${crypto.randomUUID()}${extension}` };
		});
		const inserted = await db
			.insert(photo)
			.values(
				prepared.map(({ payload, storageName }) => ({
					projectID,
					filename: storageName,
					exif: JSON.parse(payload.exif),
					latitude: payload.latitude,
					longitude: payload.longitude
				}))
			)
			.returning({ id: photo.id, filename: photo.filename });
		const idByFilename = new Map(inserted.map((row) => [row.filename, row.id]));

		const uploads = await Promise.all(
			prepared.map(async ({ payload, storageName }) => {
				const thumbURL = await createPresignedUploadURL(`photos/${projectID}/${storageName}/thumb`);
				const fullURL = await createPresignedUploadURL(`photos/${projectID}/${storageName}/full`);

				return {
					clientIndex: payload.clientIndex,
					filename: storageName,
					thumbURL,
					fullURL,
					photoID: idByFilename.get(storageName)!
				};
			})
		);

		return { uploads };
	},
	createStory: async (event) => {
		const formData = await event.request.formData();
		const title = formData.get('title') as string;
		const projectID = event.params.slug;
		const user = event.locals.user;
		if (!user) return { error: 'Unauthorized' };

		const [proj] = await db.select().from(project).where(eq(project.id, projectID));
		if (!proj || proj.userID !== user.id) {
			return { error: 'Unauthorized' };
		}
		const slug =
			title
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[^a-z0-9-]/g, '') +
			'-' +
			crypto.randomUUID().slice(0, 4);
		await db.insert(story).values({
			id: crypto.randomUUID(),
			projectID,
			title,
			slug
		});
		redirect(303, `/project/${projectID}/${slug}/edit`);
	},

	deleteStory: async (event) => {
		const formData = await event.request.formData();
		const storyID = formData.get('storyID') as string;
		const projectID = event.params.slug;
		const user = event.locals.user;
		if (!user) return { error: 'Unauthorized' };

		const [proj] = await db.select().from(project).where(eq(project.id, projectID));
		if (!proj || proj.userID !== user.id) {
			return { error: 'Unauthorized' };
		}

		await db.delete(story).where(and(eq(story.id, storyID), eq(story.projectID, projectID)));
		return { success: true, storyID };
	}
};
