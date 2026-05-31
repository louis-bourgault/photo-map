import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { project, photo, story } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Photo } from '$lib/mapstore.svelte.js';
import {redirect} from '@sveltejs/kit';
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
        const photosJson = formData.get('photos') as string | null;
        const projectID = formData.get('projectID') as string;
        if (!photosJson) {
            return { uploads: [] };
        }

        const photoPayloads = JSON.parse(photosJson) as Array<{
            clientIndex: number;
            exif: string;
            latitude: string;
            longitude: string;
            filename: string;
        }>;

        const uploads = await Promise.all(
            photoPayloads.map(async (payload) => {
                const [photoRecord] = await db.insert(photo).values({
                    projectID,
                    filename: payload.filename,
                    exif: payload.exif,
                    latitude: payload.latitude,
                    longitude: payload.longitude,
                }).returning({ id: photo.id });

                const thumbURL = await createPresignedUploadURL(`photos/${projectID}/${payload.filename}/thumb`);
                const fullURL = await createPresignedUploadURL(`photos/${projectID}/${payload.filename}/full`);

                return {
                    clientIndex: payload.clientIndex,
                    filename: payload.filename,
                    thumbURL,
                    fullURL,
                    photoID: photoRecord.id,
                };
            })
        );

        return { uploads };
    },
    createStory: async (event) => {
        const formData = await event.request.formData();
        const title = formData.get('title') as string;
        const projectID = event.params.slug; 
        const user = event.locals.user;

        const [proj] = await db.select().from(project).where(eq(project.id, projectID));
        if (!proj || proj.userID !== user.id) {
            return { error: 'Unauthorized' };
        }
        const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') + '-' + crypto.randomUUID().slice(0, 4);
        await db.insert(story).values({
            id: crypto.randomUUID(),
            projectID,
            title,
            slug,
        });
        redirect(303, `/project/${projectID}/${slug}`);
    },

    deleteStory: async (event) => {
        const formData = await event.request.formData();
        const storyID = formData.get('storyID') as string;
        const projectID = event.params.slug; 
        const user = event.locals.user;

        const [proj] = await db.select().from(project).where(eq(project.id, projectID));
        if (!proj || proj.userID !== user.id) {
            return { error: 'Unauthorized' };
        }

        await db.delete(story).where(eq(story.id, storyID));
        return { success: true, storyID };
    }
}