import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { db } from '$lib/server/db';
import { project, story } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: LayoutServerLoad = async (event) => {
	const [projectDetails, storyDetails] = await Promise.all([
		db.select().from(project).where(eq(project.id, event.params.slug)).execute(),
		db.select().from(story).where(eq(story.projectID, event.params.slug)).execute()
	]);

	if (projectDetails.length === 0) {
		throw error(404, 'Project not found');
	}
	return {
		user: event.locals.user,
		project: projectDetails[0],
		stories: storyDetails
	};
};
