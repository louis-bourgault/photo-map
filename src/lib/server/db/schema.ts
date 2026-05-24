import { pgTable, serial, integer, text, boolean, json, uuid } from 'drizzle-orm/pg-core';
import { user, session, account, verification } from './auth.schema';

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
export *  from './auth.schema';
