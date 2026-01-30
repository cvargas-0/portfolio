import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    lang: z.enum(['en', 'es']).default('en'),
    translationKey: z.string().optional(),
  }),
});

const work = defineCollection({
  type: "content",
  schema: z.object({
    company: z.string(),
    role: z.string(),
    dateStart: z.coerce.date(),
    dateEnd: z.union([z.coerce.date(), z.string()]),
    lang: z.enum(['en', 'es']).default('en'),
    translationKey: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    URL: z.string().optional(),
    repoURL: z.string().optional(),
    lang: z.enum(['en', 'es']).default('en'),
    translationKey: z.string().optional(),
  }),
});

export const collections = { blog, work, projects };
