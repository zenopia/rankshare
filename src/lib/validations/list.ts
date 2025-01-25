import { z } from 'zod';

export const listItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  comment: z.string().optional(),
  completed: z.boolean().optional().default(false),
  properties: z.array(z.object({
    type: z.enum(['text', 'link']).optional().default('text'),
    label: z.string().min(1, 'Label is required').max(50),
    value: z.string().min(1, 'Value is required').max(500)
  })).optional()
});

export const listSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  category: z.enum(['movies', 'tv-shows', 'books', 'restaurants', 'recipes', 'things-to-do', 'other'] as const),
  description: z.string().max(500).optional(),
  privacy: z.enum(['public', 'private'] as const),
  listType: z.enum(['ordered', 'bullet', 'task'] as const).default('ordered'),
  items: z.array(listItemSchema).min(1, 'At least one item is required'),
});

export type ListFormData = z.infer<typeof listSchema>;
