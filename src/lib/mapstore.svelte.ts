export let photos: Array<Photo> = $state([]);
export let projectID: string = '';
export let stories: Array<{ id: string; title: string; slug: string; projectID: string }> = $state(
	[]
);
export let filteredPhotos: Array<Photo> = $state([]); //inside a story, we don't want to show all of them
export let highlightedPhoto: Photo | null = $state(null);
let currentStoryID: string | null = null;
let scrollFunction: Function | null = null;

export let lightBox = $state({
	open: false,
	selectedPhoto: null as Photo | null
});

export type Photo = {
	id: number;
	filename: string;
	exif: Record<string, any>;
	latitude: string;
	longitude: string;

	thumbnailUrl: string;
	fullsizeUrl: string | null; //not initialized until requested
};

export function openLightBox(photo: Photo) {
	lightBox.open = true;
	lightBox.selectedPhoto = photo;

	if (!photo.fullsizeUrl) {
		getFullSizeUrl(photo);
	}
}

export function handleMapPhotoClick(photo: Photo) {
	if (scrollFunction) {
		scrollFunction(photo.id);
	} else {
		openLightBox(photo);
	}
}

export function initStories(
	newStories: Array<{ id: string; title: string; slug: string; projectID: string }>
) {
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

const fullsizeRequests = new Map<number, Promise<string>>();

export async function getFullSizeUrl(photo: Photo) {
	if (photo.fullsizeUrl) return photo.fullsizeUrl;
	let pending = fullsizeRequests.get(photo.id);
	if (!pending) {
		pending = (async () => {
			const response = await fetch('/api/presigned?res=full', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ projectID, filename: photo.filename })
			});

			const data = await response.json();
			photo.fullsizeUrl = data.url;
			return data.url as string;
		})();

		fullsizeRequests.set(photo.id, pending);
	}
	try {
		return await pending;
	} finally {
		fullsizeRequests.delete(photo.id);
	}
}

export async function initStory(storyBlocks: any, scrollTo: Function) {
	filteredPhotos.splice(0, filteredPhotos.length);

	for (const block of storyBlocks ?? []) {
		const storyItem = block?.story_item;
		if (storyItem?.itemType === 'photo' && storyItem.photo) {
			const photoInStory = photos.find((p) => p.id === storyItem.photo);
			if (photoInStory) {
				filteredPhotos.push(photoInStory);
			}
		}
	}
	scrollFunction = scrollTo;
}

export async function clearStoryFilters() {
	//nav away from story, show all photos again
	filteredPhotos.splice(0, filteredPhotos.length);
	filteredPhotos.push(...photos);
	currentStoryID = null;
	scrollFunction = null;
}

export async function deletePhoto(photo: Photo) {
	let photoInFiltered: boolean = false;
	const index = photos.findIndex((p) => p.id === photo.id);
	if (index !== -1) {
		photos.splice(index, 1);
	}

	const filteredIndex = filteredPhotos.findIndex((p) => p.id === photo.id);
	if (filteredIndex !== -1) {
		photoInFiltered = true;
		filteredPhotos.splice(filteredIndex, 1);
	}
	const resp = await fetch(`/api/photo?id=${photo.id}&proj=${projectID}`, {
		method: 'DELETE'
	});
	if (resp.status !== 204) {
		console.error('Failed to delete photo with id', photo.id);
		photos.push(photos[index]);
		if (photoInFiltered) {
			filteredPhotos.push(photos[index]);
		}
	}
}
