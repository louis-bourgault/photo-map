export let photos: Array<Photo> = $state([]);
export let projectID: string = "";
export let stories: Array<{ id: string; title: string; slug: string, projectID: string }> = $state([]);
export let filteredPhotos: Array<Photo> = $state([]); //inside a story, we don't want to show all of them
export let highlightedPhoto: Photo | null = $state(null);

export let lightBox = $state({
    open: false,
    selectedPhoto: null as Photo | null,
})

export type Photo = {
    id: number;
    filename: string;
    exif: Record<string, any>;
    latitude: string;
    longitude: string;

    thumbnailUrl: string;
    fullsizeUrl: string | null; //not initialized until requested
}

export function openLightBox(photo: Photo) {
    lightBox.open = true;
    lightBox.selectedPhoto = photo;

    if (!photo.fullsizeUrl) {
        getFullSizeUrl(photo);
    }
}

export function initStories(newStories: Array<{ id: string; title: string; slug: string, projectID: string }>) {
    stories.splice(0, stories.length, ...newStories);
}

export function closeLightBox() {
    lightBox.open = false;
    lightBox.selectedPhoto = null;
}

export function setProjectID(id: string) {
    projectID = id;
}

export function initPhotos(newPhotos: Array<Photo>) {
    photos.splice(0, photos.length, ...newPhotos);
    filteredPhotos.splice(0, filteredPhotos.length, ...newPhotos);
}

export async function getFullSizeUrl(photo: Photo) {
    if (!photo.fullsizeUrl) {
        const response = await fetch('/api/presigned?res=full', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ projectID, filename: photo.filename }),
        });

        const data = await response.json();
        photo.fullsizeUrl = data.url;
    }
    return photo.fullsizeUrl;
}

export async function initPhotosInStory(storyBlocks: any) {
    filteredPhotos.splice(0, filteredPhotos.length);

    for (const block of storyBlocks ?? []) {
        const storyItem = block?.story_item;
        if (storyItem?.itemType === 'photo' && storyItem.photo) {
            const photoInStory = photos.find(p => p.id === storyItem.photo);
            if (photoInStory) {
                filteredPhotos.push(photoInStory);
            }
        }
    }
}
// export async function highlightPhoto(photoID: number) {
//     const photoToHighlight = photos.find(p => p.id === photoID);
//     if (photoToHighlight) {
//         highlightedPhoto = photoToHighlight;
//     }
// }

export async function clearStoryFilters() { //nav away from story, show all photos again
    filteredPhotos.splice(0, filteredPhotos.length);
    filteredPhotos.push(...photos);
}