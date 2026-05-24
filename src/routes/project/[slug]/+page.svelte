<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import {Button} from '$lib/components/ui/button/index.js';
  let { data } = $props();
  import {photos} from '$lib/mapstore.svelte.js';
  let fileInInput: File | null = $state(null);
  let uploadButtonDisabled = $derived(fileInInput ? false : true);

  function processFile() {
    if (fileInInput) {
      console.log('Processing file:', fileInInput);
      //extract exif data on client side. If no location, then we don't want it. 
      //downsize it on client side for thumbnail
      //upload to backblaze with presigned url
    }
  }
 </script>

<div class="p-2">
<Tabs.Root value="photos" class="w-full">
 <Tabs.List class='w-full'>
  <Tabs.Trigger value="photos" >Photos</Tabs.Trigger>
  <Tabs.Trigger value="stories">Stories</Tabs.Trigger>
 </Tabs.List>
 <Tabs.Content value="photos">
  {#each photos as photo}
    <p>{photo.filename}</p>
  {/each}
  {#if data.user.id === data.project.userID}
    <p>You own this project!</p>
    <input type="file" bind:value={fileInInput}/>
    <Button onclick={processFile} disabled={uploadButtonDisabled}>Upload</Button>
    
  {/if}
 </Tabs.Content>
 <Tabs.Content value="stories">Change your password here.</Tabs.Content>
</Tabs.Root>
</div>

