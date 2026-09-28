import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { project, photo } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { deleteObject } from '$lib/server/s3';
export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) {
		return redirect(302, '/dashboard/login');
	}
	const projectsSearch = await db
		.select()
		.from(project)
		.where(eq(project.userID, event.locals.user.id))
		.execute();
	console.log(projectsSearch);

	return { user: event.locals.user, projects: projectsSearch };
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/dashboard/login');
	},
	createProject: async (event) => {
		const formData = await event.request.formData();
		const name = formData.get('name') as string;
		console.log(name);
		const [proj] = await db
			.insert(project)
			.values({
				id: crypto.randomUUID(),
				name,
				userID: event.locals.user.id
			})
			.returning({ id: project.id });
		return redirect(302, '/project/' + proj.id);
	},
	deleteProject: async (event) => {
		const formData = await event.request.formData();
		const id = formData.get('projectId') as string;
		const userId = event.locals.user.id;

		const [proj, photos] = await Promise.all([
			db
				.select()
				.from(project)
				.where(eq(project.id, id))
				.then((res) => res[0]),
			db.select().from(photo).where(eq(photo.projectID, id)).execute()
		]);
		if (!proj) {
			return redirect(302, '/dashboard');
		}
		if (proj.userID !== userId) {
			return redirect(302, '/dashboard');
		}
		const objectKeys = photos.flatMap((item) => [
			`photos/${proj.id}/${item.filename}/full`,
			`photos/${proj.id}/${item.filename}/thumb`
		]);
		for (let index = 0; index < objectKeys.length; index += 10) {
			await Promise.all(objectKeys.slice(index, index + 10).map((key) => deleteObject(key)));
		}

		await db.delete(project).where(eq(project.id, id)).execute();
		console.log('Deleted project with id:', id);
		return redirect(302, '/dashboard');
	}
};
