<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { photos, getFullSizeUrl } from '$lib/mapstore.svelte.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	let { data } = $props();
	let storyBlocks = $state(data.storyBlocks);
    let selectedChangePhotoID: string | null = $state(null);
	import { marked } from 'marked';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	onMount(() => {
		data.storyBlocks.forEach((block: any) => {
			if (block.story_item.photo) {
				const photo = photos.find((p) => p.id === block.story_item.photo);
				if (!photo) {
					console.warn(`Photo with ID ${block.story_item.photo} not found in store`);
				} else {
					getFullSizeUrl(photo);
				}
			}
		});
	});

	function moveCardUp(cardIndex: number) {
		if (cardIndex > 0) {
			storyBlocks[cardIndex - 1].story_item.indexInStory = cardIndex;
			storyBlocks[cardIndex].story_item.indexInStory = cardIndex - 1;
			storyBlocks.sort((a, b) => a.story_item.indexInStory - b.story_item.indexInStory);
		}
	}

	function moveCardDown(cardIndex: number) {
		if (cardIndex < storyBlocks.length - 1) {
			storyBlocks[cardIndex + 1].story_item.indexInStory = cardIndex;
			storyBlocks[cardIndex].story_item.indexInStory = cardIndex + 1;
			storyBlocks.sort((a, b) => a.story_item.indexInStory - b.story_item.indexInStory);
		}
	}

	function deleteCard(cardIndex: number) {
		storyBlocks.splice(cardIndex, 1);
	}
</script>

<div class="p-2">
	<a href={`/project/${page.params.slug}`}>← Back to project</a>
	<p>welcome to the story view</p>
	{#each storyBlocks as item, index}
		<Card.Root>
			{#if item.story_item.photo}
				<Card.Header>
					<Card.Title>Image</Card.Title>
				</Card.Header>
				<Card.Content>
					<img
						src={photos.find((p) => p.id === item.story_item.photo)?.fullsizeUrl}
						alt="a thing"
						class="mb-4"
					/>
					<Dialog.Root>
						<Dialog.Trigger>Change Photo</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>Change Photo</Dialog.Title>
							</Dialog.Header>
							<div class="grid gap-4 py-4">
								{#each photos as photo}
									<button type="button" onclick={() => {selectedChangePhotoID; getFullSizeUrl(photo);}}>
										<img
											src={photo.thumbnailUrl}
											alt={photo.filename}
											class="cursor-pointer"
										/>
									</button>
								{/each}
							</div>
						</Dialog.Content>
					</Dialog.Root>
					<Label for="photoCaption">Photo caption</Label>
					<Input
						value={item.story_item.photoCaption}
						placeholder="Photo caption"
						id="photoCaption"
					/>
				</Card.Content>
			{:else if item.story_item.markdownContent}
				<Textarea bind:value={item.story_item.markdownContent} class="mb-4 h-40 w-full" />
			{/if}
			<Card.Footer>
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						deleteCard(index);
					}}>Delete</Button
				>
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						moveCardUp(index);
					}}>Move Up</Button
				>
				<Button
					variant="outline"
					size="sm"
					onclick={() => {
						moveCardDown(index);
					}}>Move Down</Button
				>
			</Card.Footer>
		</Card.Root>
	{/each}
</div>
