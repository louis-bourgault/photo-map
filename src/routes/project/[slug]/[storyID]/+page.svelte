<script lang='ts'>
    import { page } from '$app/state';
    import { onMount } from 'svelte';
    import * as Card from '$lib/components/ui/card/index.js';
    import {photos, getFullSizeUrl} from '$lib/mapstore.svelte.js';
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
    });
</script>
<div class='p-2'>

    <a href={`/project/${page.params.slug}`}>← Back to project</a>
    <p>welcome to the story view</p>
    {#each data.storyBlocks as item}
        {#if item.story_item.photo}
            <img src={photos.find(p => p.id === item.story_item.photo)?.fullsizeUrl} alt="a thing" class='mb-4'/>
            <p>{item.story_item.photoCaption}</p>
        {:else if item.story_item.markdownContent}
            {@html marked.parse(item.story_item.markdownContent)}
        {/if}
        
    {/each}

</div>