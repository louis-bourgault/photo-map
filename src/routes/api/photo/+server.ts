import {db} from '$lib/server/db';
import {photo} from '$lib/server/db/schema'
import {eq} from 'drizzle-orm';
import {deleteObject} from '$lib/server/s3';

export async function DELETE({ url }) {
    console.log('Received DELETE request for photo with URL:', url.toString());
    try {
        const photoID = url.searchParams.get('id')
        const projectID = url.searchParams.get('proj')
        if (!photoID) {
            return new Response('Photo ID is required', { status: 400 });
        }
        const photoInfo = await db.select().from(photo).where(eq(photo.id, parseInt(photoID))).then(res => res[0]);
        if (!photoInfo) {
            console.error('Photo not found with ID:', photoID);
            return new Response('Photo not found', { status: 404 });
        }
        const photoNumId = parseInt(photoID);
        await db.delete(photo).where(eq(photo.id, photoNumId));
        //an example of location, c&p from backblaze - photos/ec33f524-f1d7-4b7d-8d23-5de9cd1463da/PXL_20251219_022244462.jpg/full
        console.log("s3 storage key for full image:", `photos/${projectID}/${photoInfo.filename}/full`, "and thumbnail:", `/photos/${projectID}/${photoInfo.filename}/thumb`);
        await deleteObject(`photos/${projectID}/${photoInfo.filename}/full`);
        await deleteObject(`photos/${projectID}/${photoInfo.filename}/thumb`);
        console.log('Successfully deleted photo with ID:', photoID, "and filename:", photoInfo.filename);
        
        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Error deleting photo:', error);
        return new Response('Error deleting photo', { status: 500 });
    }

}