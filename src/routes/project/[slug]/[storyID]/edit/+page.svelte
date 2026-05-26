<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { photos, getFullSizeUrl } from '$lib/mapstore.svelte.js';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	let { data } = $props();
	type StoryItem = {
		id: string;
		story: string;
		photo: number | null;
		photoCaption: string | null;
		markdownContent: string | null;
		indexInStory: number;
		itemType: 'photo' | 'text';
	};
	type RawStoryItem = Omit<StoryItem, 'itemType'> & {
		itemType: string;
	};
	let storyBlocks = $state<StoryItem[]>([]);
    let selectedChangePhotoID: number | null = $state(null);
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Label from '$lib/components/ui/label/label.svelte';

	function normalizeStoryItem(block: RawStoryItem): StoryItem {
		return {
			...block,
			itemType: block.itemType === 'photo' ? 'photo' : 'text'
		};
	}

	$effect(() => {
		storyBlocks = data.storyBlocks.map((block: RawStoryItem) => normalizeStoryItem(block));
	});
	onMount(() => {
		storyBlocks.forEach((block) => {
			if (block.photo) {
				const photo = photos.find((p) => p.id === block.photo);
				if (!photo) {
					console.warn(`Photo with ID ${block.photo} not found in store`);
				} else {
					getFullSizeUrl(photo);
				}
			}
		});
	});

	function getPhotoById(id: number | null) {
		if (!id) {
			return undefined;
		}
		return photos.find((photo) => photo.id === id);
	}

	function moveCardUp(cardIndex: number) {
		if (cardIndex > 0) {
			storyBlocks[cardIndex - 1].indexInStory = cardIndex;
			storyBlocks[cardIndex].indexInStory = cardIndex - 1;
			storyBlocks.sort((a, b) => a.indexInStory - b.indexInStory);
		}
	}

	function moveCardDown(cardIndex: number) {
		if (cardIndex < storyBlocks.length - 1) {
			storyBlocks[cardIndex + 1].indexInStory = cardIndex;
			storyBlocks[cardIndex].indexInStory = cardIndex + 1;
			storyBlocks.sort((a, b) => a.indexInStory - b.indexInStory);
		}
	}

	function deleteCard(cardIndex: number) {
		storyBlocks.splice(cardIndex, 1);
	}

    function addTextCard() {
        storyBlocks.push({
			itemType: 'text',
			markdownContent: '',
			indexInStory: storyBlocks.length,
			photo: null,
			photoCaption: '',
			id: crypto.randomUUID(),
			story: data.storyDetails.id,
        });
    }

    function addPhotoCard() {
        storyBlocks.push({
			itemType: 'photo',
			photo: null,
			photoCaption: '',
			indexInStory: storyBlocks.length,
			markdownContent: '',
			id: crypto.randomUUID(),
			story: data.storyDetails.id,
        });
    }

    let saving = $state(false);

    async function saveStory() {
		if (saving) {
			return;
		}
		saving = true;
        storyBlocks.forEach((block, index) => {
			block.indexInStory = index;
        });
		try {
			await fetch(`/project/${page.params.slug}/${page.params.storyID}/edit/save/`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ storyBlocks })
			});
		} finally {
			saving = false;
		}
    }

    $inspect(selectedChangePhotoID);
</script>

<div class="h-[calc(100dvh-4rem)] overflow-y-auto p-4 sm:p-6">
	<div class="mx-auto flex w-full max-w-3xl flex-col gap-4">
		<div class="flex flex-wrap items-center justify-between gap-3">
			<a href={`/project/${page.params.slug}`} class="text-sm text-muted-foreground hover:text-foreground">← Back to project</a>
			<Button onclick={saveStory} disabled={saving} class="min-w-[140px]">{saving ? 'Saving...' : 'Save Story'}</Button>
		</div>
		<p class="text-sm text-muted-foreground">welcome to the story view</p>
	{#each storyBlocks as item, index}
		<Card.Root class="w-full">
			{#if item.itemType === 'photo'}
				<Card.Header>
					<Card.Title>Image</Card.Title>
				</Card.Header>
				<Card.Content>
				{#if getPhotoById(item.photo) && item.photo}
					<img
						src={getPhotoById(item.photo)?.fullsizeUrl ?? getPhotoById(item.photo)?.thumbnailUrl}
						alt="a thing"
						class="mb-4 w-full rounded-md border border-border/60 bg-muted/20 object-contain"
					/>
                {:else}
                    <p class="mb-4 text-sm text-muted-foreground">Photo not found, add one!</p>
                {/if}
					<Dialog.Root>
						<Dialog.Trigger>
							<Button variant="outline" size="sm">{item.photo ? 'Change' : 'Add'} Photo</Button>
						</Dialog.Trigger>
						<Dialog.Content>
							<Dialog.Header>
								<Dialog.Title>{item.photo ? 'Change' : 'Add'}</Dialog.Title>
							</Dialog.Header>
							<div class="grid gap-4 py-4">
								{#each photos as photo}
									<button
										type="button"
										onclick={() => {
											selectedChangePhotoID = photo.id;
											getFullSizeUrl(photo);
										}}
										class="rounded-md border-2 p-1 hover:border-primary {selectedChangePhotoID === photo.id ? 'border-primary' : ''}"
									>
										<img
											src={photo.thumbnailUrl}
											alt={photo.filename}
											class="cursor-pointer"
										/>
									</button>
								{/each}
							</div>
							<Dialog.Footer>
                            <Dialog.Close>

								<Button
									variant="outline"
									onclick={() => {
                                        if (selectedChangePhotoID) {
                                            item.photo = selectedChangePhotoID;
											const selectedPhoto = getPhotoById(selectedChangePhotoID);
											if (selectedPhoto) {
                                                getFullSizeUrl(selectedPhoto);
											}
											selectedChangePhotoID = null;
										}
									}}
									disabled={!selectedChangePhotoID}
								>
									Save
								</Button>
                            </Dialog.Close>
							</Dialog.Footer>
						</Dialog.Content>
					</Dialog.Root>
					<Label for="photoCaption">Photo caption</Label>
					<Input
						value={item.photoCaption}
						placeholder="Photo caption"
						id="photoCaption"
					/>
				</Card.Content>
			{:else if item.itemType === 'text'}
				<Textarea bind:value={item.markdownContent} class="mb-4 h-40 w-full" />
			{/if}
			<Card.Footer class="flex flex-wrap gap-2">
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
		<div class="mt-2 flex flex-wrap gap-2">
			<Button onclick={addTextCard}>Add Text Component</Button>
			<Button onclick={addPhotoCard} variant="outline">Add Photo Component</Button>
		</div>
	</div>
</div>

<br>
<br>
<br>
<br>
