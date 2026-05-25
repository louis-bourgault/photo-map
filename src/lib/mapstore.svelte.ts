export let photos: Array<Photo> = $state([]);
export let projectID: string = "";
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

export function closeLightBox() {
    lightBox.open = false;
    lightBox.selectedPhoto = null;
}

export function setProjectID(id: string) {
    projectID = id;
}

export function initPhotos(newPhotos: Array<Photo>) {
    photos.splice(0, photos.length, ...newPhotos);
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

