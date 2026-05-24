<script lang="ts">
  import { enhance } from '$app/forms';
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import { Button } from '$lib/components/ui/button/index.js';
  let { data } = $props();
  import { photos } from '$lib/mapstore.svelte.js';

  let fileInput = $state<HTMLInputElement | null>(null);
  let selectedFile: File | null = $state(null);
  let isUploading = $state(false);
  let uploadButtonDisabled = $derived(!selectedFile || isUploading);

  function handleFileChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    selectedFile = target.files?.[0] ?? null;
  }

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
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
            return;
          }

          reject(new Error('problem making thumbnail blob :('));
        }, file.type || 'image/jpeg', 0.85);
      });

      return new File([thumbnail], file.name, {
        type: thumbnail.type || file.type,
        lastModified: file.lastModified,
      });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  const uploadFiles = ({ formData, cancel }: { formData: FormData; cancel: () => void }) => {
    const file = selectedFile;
    if (!file) {
      cancel();
      return;
    }
    formData.set('exif', '{}');
    formData.set('latitude', '');
    formData.set('longitude', '');
    formData.set('filename', file.name);
    formData.set('projectID', data.project.id);

    isUploading = true;

    return async ({ result }: { result: { type: string; data?: unknown } }) => {
      try {
        if (result.type !== 'success') {
          return;
        }

        const { thumbURL, fullURL, photoID } = result.data as {
          thumbURL: string;
          fullURL: string;
          photoID: number;
        };

        const thumbnailFile = await createThumbnail(file);
        console.log('Uploading thumbnail and full-size image to S3 with URLs:', thumbURL, fullURL);

        const [thumbResponse, fullResponse] = await Promise.all([
          fetch(thumbURL, {
            method: 'PUT',
            body: thumbnailFile,
          }),
          fetch(fullURL, {
            method: 'PUT',
            body: file,
          }),
        ]);

        if (!thumbResponse.ok || !fullResponse.ok) {
          throw new Error('Upload failed after the server created the photo record');
        }
        console.log('Upload successful, updating UI with new photo');

        photos.unshift({
          id: photoID,
          filename: file.name,
          exif: {},
          latitude: '',
          longitude: '',
          thumbnailUrl: thumbURL, //NO this is only an upload url, have to do stuff to get the real url TODO
          fullsizeUrl: null,
        });

        selectedFile = null;

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
    <form method="post" action="?/uploadFileURLs" enctype="multipart/form-data" use:enhance={uploadFiles}>
      <input bind:this={fileInput} type="file" name="photos" accept="image/*" onchange={handleFileChange} />
      <Button type='submit' disabled={uploadButtonDisabled}>{isUploading ? 'Uploading...' : 'Upload'}</Button>
    </form>
    
  {/if}
 </Tabs.Content>
 <Tabs.Content value="stories">Stories aint ready yet.</Tabs.Content>
</Tabs.Root>
</div>

