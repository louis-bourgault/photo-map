import { pgTable, serial, text, boolean, json, uuid, integer } from 'drizzle-orm/pg-core';
import { user } from './auth.schema';

export const project = pgTable('project', {
    id: uuid('id').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  public: boolean('public').default(false).notNull(),
  userID: text('owner_id')
	.notNull()
	.references(() => user.id, { onDelete: 'cascade' }),
});

export const photo = pgTable("photo", {
    id: serial('id').primaryKey(),
    projectID: uuid('project_id')
        .notNull()
        .references(() => project.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    exif: json('exif'),
    latitude: text('latitude'),
    longitude: text('longitude'),
})

export const story = pgTable("story", {
    id: uuid('id').notNull().unique(),
    projectID: uuid('project_id')
        .notNull()
        .references(() => project.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
})

export const storyItem = pgTable("story_item", {
    id: serial('id').primaryKey(),
    story: uuid('story_id')
        .notNull()
        .references(() => story.id, { onDelete: 'cascade' }),
    photo: serial('photo_id')
        .references(() => photo.id, { onDelete: 'cascade' }),
    photoCaption: text('photo_caption'),
    markdownContent: text('markdown_content'),
    indexInStory: integer('index_in_story').notNull(), 
    //basic indexing for now, make it sparse if there's a problem later.
    //photo, photocaption and markdown content are all optional, but at least one must be provided.

}
)

export *  from './auth.schema';
