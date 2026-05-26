<script lang='ts'>
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from "$lib/components/ui/dialog/index.js";
	import { Button } from '$lib/components/ui/button/index.js';
	import {Input} from '$lib/components/ui/input/index.js';

	let { data }: { data: PageServerData } = $props();
</script>

<h1>Hi, {data.user.name}!</h1>
<p>Your user ID is {data.user.id}.</p>
<form method="post" action="?/signOut" use:enhance>
	<Button>Sign out</Button>
</form>
<div class="p-4">

	<h1 class='font-heading text-3xl '>Projects</h1>
	<Dialog.Root>
		<Dialog.Trigger>Create New Project</Dialog.Trigger>
		<Dialog.Content>
		  <Dialog.Header>
			<Dialog.Title>Create New Project</Dialog.Title>
			<Dialog.Description>
			  Create a new project for photos.
			</Dialog.Description>
		  </Dialog.Header>
		  <form method="post" action="?/createProject" class="grid w-full items-center gap-4 py-4">
			<Input name="name" placeholder="Project Name" required />
			<Button type="submit">Create</Button>
		  </form>
		</Dialog.Content>
		
	  </Dialog.Root>
	  
	<div class='grid-cols-3 mt-4 grid gap-4'>
		{#each data.projects as project}
		<Card.Root>
			<Card.Header>
				<Card.Title>{project.name}</Card.Title>
				<Card.Description>{project.description}</Card.Description>
			</Card.Header>
			<Card.Content>
			</Card.Content>
			<Card.Footer>
				<div class='flex justify-between flex-row w-full gap-2'>
					<a href={`/project/${project.id}/`} class="text-blue-600 hover:underline">View Project</a>
					<form method="post" action="?/deleteProject" use:enhance class="m-0">
						<input type="hidden" name="projectId" value={project.id} />
						<Button type="submit" variant='outline'>Delete</Button>
					</form>
				</div>
			</Card.Footer>
		</Card.Root>
		{/each}
		
	</div>
</div>

