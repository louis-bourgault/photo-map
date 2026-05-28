<script lang='ts'>
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import * as Card from '$lib/components/ui/card/index.js';
    import {photos, getFullSizeUrl, highlightedPhoto, initPhotosInStory} from '$lib/mapstore.svelte.js';
    import { mode } from "mode-watcher";

    let {data} = $props();
    import { marked } from 'marked';
    onMount(() => {
        data.storyBlocks.forEach((block: any) => {
            if (block.story_item.photo) {
                const photo = photos.find(p => p.id === block.story_item.photo);
                if (!photo) {
                    console.warn(`Photo with ID ${block.story_item.photo} not found in store`);
                } else {
                    getFullSizeUrl(photo);
                }
            }
        });
        initPhotosInStory(data.storyBlocks); //this filters the photos to only those in the story
    });
</script>
<div class='p-2'>

    <a href={`/project/${page.params.slug}`}>← Back to project</a>
    <h1 class='text-4xl font-bold mb-4'>{data.storyDetails.title}</h1>
    {#each data.storyBlocks as item}
        {#if item.story_item.photo}
            <img src={photos.find(p => p.id === item.story_item.photo)?.fullsizeUrl} alt="a thing" class='mb-4'/>
            <p>{item.story_item.photoCaption}</p>
        {:else if item.story_item.markdownContent}
        <div class='prose {mode.current === 'dark' ? 'prose-invert' : ''} mb-4'>
            {@html marked.parse(item.story_item.markdownContent)}
        </div>
        {/if}
        
    {/each}

</div>

<style>
    :global(.prose h1) { font-size: 2em; }
    :global(.prose h2) { font-size: 1.5em; }
    :global(.prose h3) { font-size: 1.25em; }
  </style>