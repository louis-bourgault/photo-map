import { db } from '$lib/server/db';
import { story, storyItem } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

export async function load({ params, locals }) {
    const storyDetails = await db
        .select()
        .from(story)
        .where(eq(story.slug, params.storyID))
        .execute();
    if (storyDetails.length === 0) {
        error(404, 'Story not found');
    }
    const storyBlocks = await db
        .select({
            id: storyItem.id,
            story: storyItem.story,
            photo: storyItem.photo,
            photoCaption: storyItem.photoCaption,
            markdownContent: storyItem.markdownContent,
            indexInStory: storyItem.indexInStory,
            itemType: storyItem.itemType
        })
        .from(storyItem)
        .where(eq(storyItem.story, storyDetails[0].id))
        .orderBy(storyItem.indexInStory)
        .execute();
    
    return { storyDetails: storyDetails[0], storyBlocks };
}


