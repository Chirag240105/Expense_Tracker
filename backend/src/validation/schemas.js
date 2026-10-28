import { z } from "zod";

const email = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const id = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid MongoDB id");
const transactionBody = z.object({
  source: z.string().trim().min(1).max(120),
  amount: z.coerce.number().finite().positive().max(1_000_000_000),
  date: z.coerce.date(),
  icon: z.string().max(32).optional(),
}).strict();
const emptyObject = z.object({}).strict();
export const emptyRequestSchema = z.object({ body: emptyObject, params: emptyObject, query: emptyObject });

export const signUpSchema = z.object({
  body: z.object({
    username: z.string().trim().min(1).max(80),
    email,
    password: z.string().min(8).max(128),
  }).strict(),
  params: z.object({}), query: z.object({}),
});

export const loginSchema = z.object({
  body: z.object({ email, password: z.string().min(1).max(128) }).strict(),
  params: z.object({}), query: z.object({}),
});

export const transactionSchema = z.object({
  body: transactionBody,
  params: z.object({}), query: z.object({}),
});

export const idParamSchema = z.object({
  body: z.object({}),
  params: z.object({ id }), query: z.object({}),
});

export const profileSchema = z.object({
  body: z.object({
    username: z.string().trim().min(1).max(80).optional(),
    email,
  }).partial().strict().refine((body) => Object.keys(body).length > 0, "Provide a profile field to update"),
  params: z.object({}), query: z.object({}),
});
