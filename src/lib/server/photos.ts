import { env } from '$env/dynamic/public';
import type { Photo } from '$lib/mapstore.svelte.js';

type PhotoRow = {
	id: number;
	filename: string;
	latitude: string | null;
	longitude: string | null;
};

export function toClientPhoto(row: PhotoRow, projectID: string): Photo {
	return {
		id: row.id,
		filename: row.filename,
		exif: {},
		latitude: row.latitude ?? '',
		longitude: row.longitude ?? '',
		thumbnailUrl: `${env.PUBLIC_S3_PUBLIC_URL}/photos/${projectID}/${row.filename}/thumb`,
		fullsizeUrl: null
	};
}
