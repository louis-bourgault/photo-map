<script lang="ts">
	import { getGPSandExif } from '$lib/getGPS.js';
	import { enhance } from '$app/forms';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	let { data } = $props();
	import {
		photos,
		lightBox,
		openLightBox,
		closeLightBox,
		initStories,
		clearStoryFilters,
    deletePhoto,
		type Photo,

		filteredPhotos

	} from '$lib/mapstore.svelte.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { Delete, Trash2 } from '@lucide/svelte';

	let noExifError = $state(false);

	let fileInput = $state<HTMLInputElement | null>(null);
	let selectedFiles = $state<File[]>([]);
	let isUploading = $state(false);
	let uploadButtonDisabled = $derived(selectedFiles.length === 0 || isUploading);

	function handleFileChange(event: Event) {
		const target = event.currentTarget as HTMLInputElement;
		selectedFiles = Array.from(target.files ?? []);
	}

	onMount(() => {
		clearStoryFilters();
	});

	

	async function createThumbnail(file: File, maxSize = 512) {
		if (!file.type.startsWith('image/')) {
			return file;
		}

		const imageUrl = URL.createObjectURL(file);

		try {
			const image = await new Promise<HTMLImageElement>((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(img);
				img.onerror = () => reject(new Error('Unable to load image for thumbnail generation'));
				img.src = imageUrl;
			});

			const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
			const width = Math.max(1, Math.round(image.width * scale));
			const height = Math.max(1, Math.round(image.height * scale));

			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			const context = canvas.getContext('2d');
			if (!context) {
				return file;
			}

			context.drawImage(image, 0, 0, width, height);

			const thumbnail = await new Promise<Blob>((resolve, reject) => {
				canvas.toBlob(
					(blob) => {
						if (blob) {
							resolve(blob);
							return;
						}

						reject(new Error('problem making thumbnail blob :('));
					},
					file.type || 'image/jpeg',
					0.85
				);
			});

			return new File([thumbnail], file.name, {
				type: thumbnail.type || file.type,
				lastModified: file.lastModified
			});
		} finally {
			URL.revokeObjectURL(imageUrl);
		}
	}

	const uploadFiles = async ({ formData, cancel }: { formData: FormData; cancel: () => void }) => {
		const files = selectedFiles;
		if (files.length === 0) {
			cancel();
			return;
		}

		const photoPayloads: Array<{
			clientIndex: number;
			exif: string;
			latitude: string;
			longitude: string;
			filename: string;
		}> = [];

		for (const [index, file] of files.entries()) {
			const exifdata = await getGPSandExif(file);
			if (!exifdata) {
				noExifError = true;
				continue;
			}

			photoPayloads.push({
				clientIndex: index,
				exif: JSON.stringify(exifdata.exif),
				latitude: exifdata.latitude,
				longitude: exifdata.longitude,
				filename: file.name
			});
		}

		if (photoPayloads.length === 0) {
			fileInput?.value && (fileInput.value = '');
			setTimeout(() => (noExifError = false), 5000);
			cancel();
			return;
		}

		formData.set('photos', JSON.stringify(photoPayloads));
		formData.set('projectID', data.project.id);

		isUploading = true;

		return async ({ result }: { result: { type: string; data?: unknown } }) => {
			try {
				if (result.type !== 'success') {
					return;
				}
				const { uploads } = result.data as {
					uploads: Array<{
						clientIndex: number;
						thumbURL: string;
						fullURL: string;
						photoID: number;
						filename: string;
					}>;
				};

				await Promise.all(
					uploads.map(async (upload) => {
						const file = files[upload.clientIndex];
						if (!file) {
							return;
						}

						const thumbnailFile = await createThumbnail(file);
						const fullSizeFile = await createThumbnail(file, 3000); //make it not as stupidly large - my phone images are like 6mb each
						console.log(
							'original file size:',
							file.size,
							'thumbnail size:',
							thumbnailFile.size,
							'full size (resized) file size:',
							fullSizeFile.size
						);

						const [thumbResponse, fullResponse] = await Promise.all([
							fetch(upload.thumbURL, {
								method: 'PUT',
								body: thumbnailFile
							}),
							fetch(upload.fullURL, {
								method: 'PUT',
								body: fullSizeFile
							})
						]);

						if (!thumbResponse.ok || !fullResponse.ok) {
							throw new Error('Upload failed after the server created the photo record');
						}
						console.log('Upload successful, updating UI with new photo');

						const resp = await fetch('/api/presigned?res=thumb', {
							method: 'POST',
							headers: { 'content-type': 'application/json' },
							body: JSON.stringify({ projectID: data.project.id, filename: upload.filename })
						});
						const { url } = await resp.json();

						const payload = photoPayloads.find((p) => p.clientIndex === upload.clientIndex);
						let newPhoto = {
							id: upload.photoID,
							filename: upload.filename,
							exif: payload ? JSON.parse(payload.exif) : {},
							latitude: payload?.latitude ?? '',
							longitude: payload?.longitude ?? '',
							thumbnailUrl: url,
							fullsizeUrl: null
						}
						console.log(newPhoto)
						photos.unshift(newPhoto);
						filteredPhotos.unshift(newPhoto)
					})
				);

				selectedFiles = [];

				if (fileInput) {
					fileInput.value = '';
				}
			} finally {
				isUploading = false;
			}
		};
	};
</script>

<div class="p-2">
	<Tabs.Root value="photos" class="w-full">
		<Tabs.List class="w-full">
			<Tabs.Trigger value="photos">Photos</Tabs.Trigger>
			<Tabs.Trigger value="stories">Stories</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="photos">
			<div class="grid grid-cols-4 gap-2">
				{#if noExifError}
					<p class="col-span-4 text-red-500">
						There wasn't any gps information in that file, so it wasn't uploaded
					</p>
				{/if}
				{#each photos as photo (photo.id)}
					<div class="group relative">
						<button
							type="button"
							onclick={() => {
								openLightBox(photo);
							}}
						>
							<img
								src={photo.thumbnailUrl}
								alt={photo.filename}
								class="aspect-square object-cover"
							/>
						</button>
						<Button
							variant="secondary"
							size="icon"
							class="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100"
							onclick={() => {
								deletePhoto(photo);
							}}
						>
							<Trash2></Trash2>
							<span class="sr-only">Delete Photo</span>
						</Button>
					</div>
				{/each}
			</div>
			{#if data.user && data.user.id === data.project.userID}
				<p>You own this project!</p>
				<form
					method="post"
					action="?/uploadFileURLs"
					enctype="multipart/form-data"
					use:enhance={uploadFiles}
				>
					<input
						bind:this={fileInput}
						type="file"
						name="photos"
						accept="image/*"
						multiple
						onchange={handleFileChange}
					/>
					<Button type="submit" disabled={uploadButtonDisabled}
						>{isUploading ? 'Uploading...' : 'Upload'}</Button
					>
				</form>
			{/if}
		</Tabs.Content>
		<Tabs.Content value="stories">
			<div class="flex flex-col gap-4">
				<h2 class="text-2xl font-bold">Stories</h2>
				<Dialog.Root>
					<Dialog.Trigger>Create Story</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>Create a new story</Dialog.Title>
							<Dialog.Description>
								Start a new story to group photos together and add captions.
							</Dialog.Description>
						</Dialog.Header>
						<form method="post" action="?/createStory" use:enhance>
							<Input type="text" name="title" placeholder="Story Title" class="mb-4" />
							<Button type="submit">Create</Button>
						</form>
					</Dialog.Content>
				</Dialog.Root>
				{#each data.stories as story}
					<div class="rounded border p-4">
						<h3 class="text-xl font-semibold">{story.title}</h3>
						<Button href={`/project/${page.params.slug}/${story.slug}`}>Go To Story</Button>
						<Button href={`/project/${page.params.slug}/${story.slug}/edit`} variant="outline"
							>Edit Story</Button
						>
					</div>
				{/each}
			</div>
		</Tabs.Content>
	</Tabs.Root>
</div>
