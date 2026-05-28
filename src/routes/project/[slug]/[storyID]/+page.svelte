<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		photos,
		getFullSizeUrl,
		highlightedPhoto,
		initPhotosInStory
	} from '$lib/mapstore.svelte.js';
	import { mode } from 'mode-watcher';

	let { data } = $props();
	import { marked } from 'marked';
	$effect(() => { //effect because onMount runs before the layout onMount that loads photos.
		if (photos.length > 0) {
			data.storyBlocks.forEach((block: any) => {
				if (block.story_item.photo) {
					const photo = photos.find((p) => p.id === block.story_item.photo);
					if (photo) getFullSizeUrl(photo);
				}
			});
			initPhotosInStory(data.storyBlocks);
		}
	});
</script>

<div class="p-2">
	<a href={`/project/${page.params.slug}`}>← Back to project</a>
	<h1 class="mb-4 text-4xl font-bold">{data.storyDetails.title}</h1>
	{#each data.storyBlocks as item}
		{#if item.story_item.photo}
			<img
				src={photos.find((p) => p.id === item.story_item.photo)?.fullsizeUrl ?? photos.find((p) => p.id === item.story_item.photo)?.thumbnailUrl}
				alt="a thing"
				class="mb-4"
			/>
			<p>{item.story_item.photoCaption}</p>
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
