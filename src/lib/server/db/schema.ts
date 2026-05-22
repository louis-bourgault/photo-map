import { pgTable, serial, integer, text, boolean } from 'drizzle-orm/pg-core';
import { user, session, account, verification } from './auth.schema';

export const project = pgTable('project', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  public: boolean('public').default(false).notNull(),
  userID: text('owner_id')
	.notNull()
	.references(() => user.id, { onDelete: 'cascade' }),
});

export *  from './auth.schema';
