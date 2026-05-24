export let photos: Array<Photo> = $state([]);
export let projectID: string = "";

export type Photo = {
    id: number;
    filename: string;
    exif: Record<string, any>;
    latitude: string;
    longitude: string;

    thumbnailUrl: string;
    fullsizeUrl: string | null; //not initialized until requested
}

export function setProjectID(id: string) {
    projectID = id;
}

export function initPhotos(newPhotos: Array<Photo>) {
    photos.splice(0, photos.length, ...newPhotos);
}

export async function getFullSizeUrl(photo: Photo) {
    if (!photo.fullsizeUrl) {
        const response = await fetch('/api/fullsize', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ projectID, filename: photo.filename }),
        });

        const data = await response.json();
        photo.fullsizeUrl = data.fullsizeUrl;
    }
    return photo.fullsizeUrl;
}

