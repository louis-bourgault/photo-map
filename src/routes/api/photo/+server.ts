import { db } from '$lib/server/db';
import { photo, project } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { deleteObject } from '$lib/server/s3';
import { error } from '@sveltejs/kit';

export async function DELETE({ url, locals }) {
	try {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}
		const photoID = Number(url.searchParams.get('id'));
		if (!Number.isInteger(photoID)) throw error(400, 'A valid photo ID is required');

		const photoInfo = await db
			.select({ photo, ownerID: project.userID })
			.from(photo)
			.innerJoin(project, eq(photo.projectID, project.id))
			.where(eq(photo.id, photoID))
			.then((rows) => rows[0]);
		if (!photoInfo) {
			throw error(404, 'Photo not found');
		}
		if (photoInfo.ownerID !== locals.user.id) throw error(403, 'Forbidden');

		const prefix = `photos/${photoInfo.photo.projectID}/${photoInfo.photo.filename}`;
		await Promise.all([deleteObject(`${prefix}/full`), deleteObject(`${prefix}/thumb`)]);
		await db.delete(photo).where(eq(photo.id, photoID));

		return new Response(null, { status: 204 });
	} catch (error) {
		if (error && typeof error === 'object' && 'status' in error) throw error;
		console.error('Error deleting photo:', error);
		return new Response('Error deleting photo', { status: 500 });
	}
}
