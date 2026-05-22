import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import type { PageServerLoad } from './$types';
import { auth } from '$lib/server/auth';

export const load: PageServerLoad = (event) => {
	if (!event.locals.user) {
		return redirect(302, '/demo/better-auth/login');
	}
	const projects = [
		{
			id: "fwe53we",
			name: "Project 1",
			description: "This is the first project",
			createdAt: new Date(),
		},
		{
			id: "fwe53we",
			name: "Project 2",
			description: "This is the second project",
			createdAt: new Date(),
		},
		
	]
	return { user: event.locals.user, projects };
};

export const actions: Actions = {
	signOut: async (event) => {
		await auth.api.signOut({
			headers: event.request.headers
		});
		return redirect(302, '/demo/better-auth/login');
	}
};
