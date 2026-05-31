<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		photos,
		getFullSizeUrl,
		highlightedPhoto,
		initStory,
		openLightBox,
		setFullURL,
		setHighlightedPhotos
	} from '$lib/mapstore.svelte.js';
	import type { Photo } from '$lib/mapstore.svelte.js';
	import { mode } from 'mode-watcher';
	import Button from '$lib/components/ui/button/button.svelte';

	function scrollToPhoto(photoID: number) {
		const el = document.getElementById(`story-photo-${photoID}`);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
	let storyContainer: HTMLDivElement;
	onMount(() => {
		if (!storyContainer) return;
		const cleanup = observeStoryImages(storyContainer);
		return cleanup;
	});
	let { data } = $props();
	import { marked } from 'marked';
	import { Maximize2 } from '@lucide/svelte';
	let storyInitialized = false;

	$effect(() => {
		if (storyInitialized || photos.length === 0) return;

		storyInitialized = true;

		for (const photo of data.photoPresigned) {
			setFullURL(photo);
		}

		initStory(data.storyBlocks, scrollToPhoto);
	});
	const visibilityById = new Map<number, number>();
	let currentHighlightedId: number | null = null;
	function observeStoryImages(container: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const id = Number((entry.target as HTMLElement).dataset.photoId);
					const totalArea = entry.boundingClientRect.width * entry.boundingClientRect.height;
					const visibleArea = entry.intersectionRect.width * entry.intersectionRect.height;
					const visibleRatio = totalArea > 0 ? visibleArea / totalArea : 0;
					visibilityById.set(id, visibleRatio);
				}

				const visiblePhotos = Array.from(visibilityById, ([photoId, visibleRatio]) => ({
					photoId,
					visibleRatio
				})).sort((a, b) => b.visibleRatio - a.visibleRatio);

				setHighlightedPhotos(visiblePhotos);
			},
			{ root: container, threshold: [0, 0.25, 0.5, 0.75, 1] }
		);

		const images = container.querySelectorAll<HTMLImageElement>('[data-photo-id]');
		images.forEach((img) => observer.observe(img));
		return () => observer.disconnect();
	}
</script>

<svelte:head>
	<title>{data.storyDetails.title} | photomap</title>
</svelte:head>

<div class="h-[calc(100dvh-4rem)] overflow-y-auto p-4" bind:this={storyContainer}>
	<Button href={`/project/${page.params.slug}`} variant="ghost">← Back to project</Button>
	<h1 class="mb-4 text-4xl font-bold">{data.storyDetails.title}</h1>
	{#each data.storyBlocks as item}
		{#if item.story_item.photo}
			<div class="group relative">
				<img
					src={photos.find((p) => p.id === item.story_item.photo)?.fullsizeUrl ??
						photos.find((p) => p.id === item.story_item.photo)?.thumbnailUrl}
					alt={item.story_item.photoCaption ?? 'Story photo'}
					class="mt-4 block w-full"
					loading="lazy"
					data-photo-id={item.story_item.photo}
					id={`story-photo-${item.story_item.photo}`}
				/>
				<Button
					variant="secondary"
					size="icon"
					class="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
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
