import { db } from '$lib/server/db';
import { eq, inArray } from 'drizzle-orm';
import { story, storyItem } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';

type StoryBlockPayload = {
    id: string;
    story: string;
    photo: number | null;
    photoCaption: string | null;
    markdownContent: string | null;
    indexInStory: number;
    itemType: 'photo' | 'text';
};

export async function POST({ request, params }) {
    const { storyBlocks } = (await request.json()) as { storyBlocks: StoryBlockPayload[] };
    if (!params.storyID) {
        error(400, 'Story ID is required');
    }
    const storyInfo = await db
        .select()
        .from(story)
        .where(eq(story.slug, params.storyID))
        .then((res) => res[0]);
    if (!storyInfo) {
        error(404, 'Story not found');
    }
    const normalizedBlocks = storyBlocks.map((block, index) => ({
        ...block,
        story: storyInfo.id,
        indexInStory: index,
        itemType: block.itemType === 'photo' ? 'photo' : 'text'
    }));

    const oldData = await db.select().from(storyItem).where(eq(storyItem.story, storyInfo.id));
    const oldIds = new Set(oldData.map((block) => block.id));
    const newIds = new Set(normalizedBlocks.map((block) => block.id));
    const idsToDelete = oldData
        .filter((block) => !newIds.has(block.id))
        .map((block) => block.id);

    if (idsToDelete.length > 0) {
        await db.delete(storyItem).where(inArray(storyItem.id, idsToDelete));
    }

    for (const block of normalizedBlocks) {
        if (oldIds.has(block.id)) {
            await db
                .update(storyItem)
                .set({
                    story: block.story,
                    photo: block.photo,
                    photoCaption: block.photoCaption,
                    markdownContent: block.markdownContent,
                    indexInStory: block.indexInStory,
                    itemType: block.itemType
                })
                .where(eq(storyItem.id, block.id));
        } else {
            await db.insert(storyItem).values({
                id: block.id,
                story: block.story,
                photo: block.photo,
                photoCaption: block.photoCaption,
                markdownContent: block.markdownContent,
                indexInStory: block.indexInStory,
                itemType: block.itemType
            });
        }
    }

    return new Response(JSON.stringify({ message: 'Story saved successfully!' }), { status: 200 });
}