<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageServerData } from './$types';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { authClient } from '$lib/authClient';
	let { data }: { data: PageServerData } = $props();

	let projects = $state(data.projects);

	
	
</script>

<svelte:head>
	<title>Dashboard | photomap</title>
</svelte:head>

<div class="p-4">
	<div class="flex items-center justify-between gap-4">
		<h1 class="font-heading text-3xl">Projects</h1>
		<Dialog.Root>
			<Dialog.Trigger><Button>Create New Project</Button></Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Create New Project</Dialog.Title>
					<Dialog.Description>Create a new project for photos.</Dialog.Description>
				</Dialog.Header>
				<form method="post" action="?/createProject" class="grid w-full items-center gap-4 py-4">
					<Input name="name" placeholder="Project Name" required />
					<Button type="submit">Create</Button>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="mt-4 grid grid-cols-3 gap-4">
		{#each data.projects as project}
			<Card.Root>
				<Card.Header>
					<Card.Title>{project.name}</Card.Title>
					<Card.Description>{project.description}</Card.Description>
				</Card.Header>
				<Card.Content></Card.Content>
				<Card.Footer>
					<div class="flex w-full flex-row justify-between gap-2">
						<a href={`/project/${project.id}/`} class="text-blue-600 hover:underline"
							>View Project</a
						>
						<form method="post" action="?/deleteProject" use:enhance class="m-0">
							<input type="hidden" name="projectId" value={project.id} />
							<Button type="submit" variant="outline">Delete</Button>
						</form>
					</div>
				</Card.Footer>
			</Card.Root>
		{/each}
	</div>
	{#if data.projects.length === 0}
		<p class="mt-4 text-center text-gray-500">A project is a grouping of photos on a map. Create one to get started!</p>
	{/if}
</div>
