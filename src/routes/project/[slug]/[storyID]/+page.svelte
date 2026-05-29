<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		photos,
		getFullSizeUrl,
		highlightedPhoto,
		initStory,
		openLightBox
	} from '$lib/mapstore.svelte.js';
	import type { Photo } from '$lib/mapstore.svelte.js';
	import { mode } from 'mode-watcher';
	import Button from '$lib/components/ui/button/button.svelte';

	function scrollToPhoto(photoID: number) {
		const el = document.getElementById(`story-photo-${photoID}`);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}

	let { data } = $props();
	import { marked } from 'marked';
	import { Maximize2 } from '@lucide/svelte';
	let storyInitialized = false;

	$effect(() => {
		if (storyInitialized || photos.length === 0) return;

		storyInitialized = true;

		for (const block of data.storyBlocks) {
			if (block.story_item.photo) {
				const photo = photos.find((p) => p.id === block.story_item.photo);
				if (photo && !photo.fullsizeUrl) {
					void getFullSizeUrl(photo);
				}
			}
		}

		initStory(data.storyBlocks, scrollToPhoto);
	});
</script>

<div class="h-[calc(100dvh-4rem)] overflow-y-auto p-4">
	<Button href={`/project/${page.params.slug}`} variant='ghost'>← Back to project</Button>
	<h1 class="mb-4 text-4xl font-bold">{data.storyDetails.title}</h1>
	{#each data.storyBlocks as item}
		{#if item.story_item.photo}
			<div class="relative group">
				<img
					src={photos.find((p) => p.id === item.story_item.photo)?.fullsizeUrl ??
						photos.find((p) => p.id === item.story_item.photo)?.thumbnailUrl}
					alt={item.story_item.photoCaption ?? 'Story photo'}
					class="mt-4 block w-full"
					loading="lazy"
					id={`story-photo-${item.story_item.photo}`}
				/>
				<Button
					variant="secondary"
					size="icon"
					class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
					onclick={() => openLightBox(photos?.find((p) => p.id === item.story_item.photo) as Photo)}
				>
					<Maximize2 />
					<span class="sr-only">View full size</span>
				</Button>

				<p class="text-secondary-foreground">{item.story_item.photoCaption}</p>
			</div>
		{:else if item.story_item.markdownContent}
			<div class="prose {mode.current === 'dark' ? 'prose-invert' : ''} mb-4">
				{@html marked.parse(item.story_item.markdownContent)}
			</div>
		{/if}
	{/each}
</div>

<style>
	:global(.prose h1) {
		font-size: 2em;
	}
	:global(.prose h2) {
		font-size: 1.5em;
	}
	:global(.prose h3) {
		font-size: 1.25em;
	}
</style>
