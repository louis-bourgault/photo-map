import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { project, photo } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Photo } from '$lib/mapstore.svelte.js';
import { createPresignedDownloadURL, createPresignedUploadURL } from '$lib/server/s3';

export const load: PageServerLoad = (event) => {
    
    return { user: event.locals.user };
}

export const actions = {
    uploadFileURLs: async (event) => { 
        //we're kind of using this not for its intended purpose. We do a hidden form on the client side which is used to send the exif data/lat/long, and then it returns presigned urls for the thumbnail and full size images.
        //the main reason for this is that i dont want to kill my vercel bandwidth billing.
        //there might be a problem with ghost entries that never actually get filled with photos. We might want a cron job or something that cleans that up, or a task queue that waits for a bit and then checks.
        const formData = await event.request.formData();
        const exif = formData.get('exif') as string;
        const latitude = formData.get('latitude') as string;
        const longitude = formData.get('longitude') as string;
        const filename = formData.get('filename') as string;
        const projectID = formData.get('projectID') as string;

        const [photoRecord] = await db.insert(photo).values({
            projectID,
            filename,
            exif,
            latitude,
            longitude,
        }).returning({ id: photo.id });
        const thumbURL = await createPresignedUploadURL(`photos/${projectID}/${filename}/thumb`);
        const fullURL = await createPresignedUploadURL(`photos/${projectID}/${filename}/full`);

        return { thumbURL, fullURL, photoID: photoRecord.id };
    }
}