<script lang='ts'>
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import * as Card from '$lib/components/ui/card';

	let { data }: { data: PageServerData } = $props();
</script>

<h1>Hi, {data.user.name}!</h1>
<p>Your user ID is {data.user.id}.</p>
<form method="post" action="?/signOut" use:enhance>
	<button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">Sign out</button>
</form>
<div class="p-4">

	<h1 class='font-heading text-3xl '>Projects</h1>
	<div class='grid-cols-3 mt-4 grid gap-4'>
		{#each data.projects as project}
		<Card.Root>
			<Card.Header>
				<Card.Title>{project.name}</Card.Title>
				<Card.Description>{project.description}</Card.Description>
			</Card.Header>
			<Card.Content>
				<p>Created at: {new Date(project.createdAt).toLocaleDateString()}</p>
			</Card.Content>
			<Card.Footer>
				<a href={`/dashboard/projects/${project.id}`} class="text-blue-600 hover:underline">View Project</a>
			</Card.Footer>
		</Card.Root>
		{/each}
	</div>
</div>

