<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import {
		photos,
		initStory,
		initPhotos,
		openLightBox,
		setFullURL,
		setHighlightedPhotos
	} from '$lib/mapstore.svelte.js';
	import type { Photo } from '$lib/mapstore.svelte.js';
	import { mode } from 'mode-watcher';
	import { getEmbedPreferences } from '$lib/embed';
	import Button from '$lib/components/ui/button/button.svelte';

	function scrollToPhoto(photoID: number) {
		const el = document.getElementById(`story-photo-${photoID}`);
		if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	}
	let storyContainer: HTMLDivElement;
	onMount(() => {
		initPhotos(data.processedPhotos);
		for (const photo of data.photoPresigned) setFullURL(photo);
		initStory(data.storyBlocks, scrollToPhoto);
		if (!storyContainer) return;
		const cleanup = observeStoryImages(storyContainer);
		return cleanup;
	});
	let { data } = $props();
	let embed = $derived(getEmbedPreferences(page.url.searchParams, true));
	import { Maximize2 } from '@lucide/svelte';
	const visibilityById = new Map<number, number>();
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

<div
	class={embed.enabled
		? 'embed-story h-full overflow-y-auto p-4 sm:p-8'
		: 'h-[calc(100dvh-4rem)] overflow-y-auto p-4'}
	bind:this={storyContainer}
>
	{#if !embed.enabled}
		<Button href={`/project/${page.params.slug}`} variant="ghost">← Back to project</Button>
	{/if}
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

				<p class={embed.enabled ? 'embed-caption' : 'text-secondary-foreground'}>
					{item.story_item.photoCaption}
				</p>
			</div>
		{:else if item.safeHtml}
			<div class="prose {!embed.enabled && mode.current === 'dark' ? 'prose-invert' : ''} mb-4">
				{@html item.safeHtml}
			</div>
		{/if}
	{/each}
</div>

<style>
	.embed-story {
		background: var(--embed-background);
		color: var(--embed-foreground);
	}
	.embed-story h1 {
		font-family: var(--embed-heading-font);
	}
	.embed-caption {
		color: var(--embed-muted);
	}
	:global(.embed-story .prose) {
		--tw-prose-body: var(--embed-foreground);
		--tw-prose-headings: var(--embed-foreground);
		--tw-prose-lead: var(--embed-foreground);
		--tw-prose-links: var(--embed-accent);
		--tw-prose-bold: var(--embed-foreground);
		--tw-prose-counters: var(--embed-muted);
		--tw-prose-bullets: var(--embed-muted);
		--tw-prose-captions: var(--embed-muted);
		--tw-prose-quotes: var(--embed-foreground);
		--tw-prose-quote-borders: var(--embed-border);
		--tw-prose-hr: var(--embed-border);
		--tw-prose-th-borders: var(--embed-border);
		--tw-prose-td-borders: var(--embed-border);
		max-width: none;
	}
	:global(.embed-story .prose h1),
	:global(.embed-story .prose h2),
	:global(.embed-story .prose h3),
	:global(.embed-story .prose h4) {
		font-family: var(--embed-heading-font);
	}
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
