import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { file } from 'astro/loaders';
import { learningLanguage } from './i18n';

const articleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  language: z.literal(learningLanguage),
  draft: z.boolean().default(false),
  sections: z.array(z.object({
    heading: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
    examples: z.array(z.string().min(1)).default([]),
  })).min(1),
});

export const collections = {
  blog: defineCollection({ loader: file('src/data/blog.json'), schema: articleSchema }),
  grammar: defineCollection({ loader: file('src/data/grammar.json'), schema: articleSchema }),
  guides: defineCollection({ loader: file('src/data/guides.json'), schema: articleSchema }),
};
