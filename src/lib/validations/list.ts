import { z } from 'zod';

export const listItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  comment: z.string().optional(),
  link: z.string().url().optional(),
  rank: z.number().int().positive(),
});

export const listSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  category: z.enum(['movies', 'tv-shows', 'books', 'restaurants', 'recipes', 'things-to-do', 'other'] as const),
  description: z.string().max(500).optional(),
  privacy: z.enum(['public', 'private'] as const),
  items: z.array(listItemSchema).min(1, 'At least one item is required'),
});

export type ListFormData = z.infer<typeof listSchema>;
