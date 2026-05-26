<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { photos, getFullSizeUrl } from '$lib/mapstore.svelte.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	let { data } = $props();
	let storyBlocks = $state(data.storyBlocks);
    let selectedChangePhotoID: number | null = $state(null);
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

    function addTextCard() {
        storyBlocks.push({
            story_item: {
                itemType: 'text',
                markdownContent: '',
                indexInStory: storyBlocks.length,
                photo: null,
                photoCaption: '',
                id: crypto.randomUUID(),
                story: data.storyDetails.id,
            }
            
        });
    }

    function addPhotoCard() {
        storyBlocks.push({
            story_item: {
                itemType: 'photo',
                photo: null,
                photoCaption: '',
                indexInStory: storyBlocks.length,
                markdownContent: '',
                id: crypto.randomUUID(),
            }
        });
    }

    let saving = $state(false);

    async function saveStory() {
        storyBlocks.forEach((block, index) => {
            block.story_item.indexInStory = index;
        });
        await fetch(`/project/${page.params.slug}/${page.params.storyID}/edit/save/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ storyBlocks })
        });
    }
</script>

<div class="p-2">
	<a href={`/project/${page.params.slug}`}>← Back to project</a>
	<p>welcome to the story view</p>
    <Button onclick={saveStory} disabled={saving}>{saving ? 'Saving...' : 'Save Story'}</Button>
	{#each storyBlocks as item, index}
		<Card.Root>
			{#if item.story_item.itemType === 'photo'}
				<Card.Header>
					<Card.Title>Image</Card.Title>
				</Card.Header>
				<Card.Content>
                {#if photos.find((p) => p.id === item.story_item.photo) && item.story_item.photo}
					<img
						src={photos.find((p) => p.id === item.story_item.photo)?.fullsizeUrl}
						alt="a thing"
						class="mb-4"
					/>
                {:else}
                    <p class="mb-4 text-sm text-muted-foreground">Photo not found, add one!</p>
                {/if}
					<Dialog.Root>
						<Dialog.Trigger>{item.story_item.photo ? 'Change' : 'Add'} Photo</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>{item.story_item.photo ? 'Change' : 'Add'}</Dialog.Title>
							</Dialog.Header>
							<div class="grid gap-4 py-4">
								{#each photos as photo}
									<button type="button" onclick={() => {selectedChangePhotoID = photo.id; getFullSizeUrl(photo);}} class="rounded-md border-2 border-transparent p-1 hover:border-primary {selectedChangePhotoID === photo.id ? 'border-primary' : ''}">
										<img
											src={photo.thumbnailUrl}
											alt={photo.filename}
											class="cursor-pointer"
										/>
									</button>
								{/each}
							</div>
						</Dialog.Content>
                        <Dialog.Footer>
                            <Button
                                variant="outline"
                                onclick={() => {
                                    if (selectedChangePhotoID) {
                                        item.story_item.photo = selectedChangePhotoID;
                                        selectedChangePhotoID = null;
                                    }
                                }}
                                disabled={!selectedChangePhotoID}
                            >
                                Save
                            </Button>
                        </Dialog.Footer>
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
    <Button>Add Text Component</Button>
</div>
