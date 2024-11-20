import { z } from 'zod';

export const listItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  comment: z.string().optional(),
});

export const createListSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  category: z.enum(['movies', 'tv-shows', 'books', 'restaurants', 'recipes', 'things-to-do', 'other'] as const),
  description: z.string().optional(),
  privacy: z.enum(['public', 'private'] as const),
});

export type CreateListSchema = z.infer<typeof createListSchema>;
