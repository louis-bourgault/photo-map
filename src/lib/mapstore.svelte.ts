export let photos: Array<Photo> = $state([]);

export type Photo = {
    id: number;
    filename: string;
    exif: Record<string, any>;
    latitude: string;
    longitude: string;

    thumbnailUrl: string;
    fullsizeUrl: string | null; //not initialized until requested
}

export function initPhotos(newPhotos: Array<Photo>) {
    photos.splice(0, photos.length, ...newPhotos);
}

export function getFullSizeUrl(photo: Photo) {
    if (!photo.fullsizeUrl) {
        //get presigned url
        
    }
    return photo.fullsizeUrl;
}

