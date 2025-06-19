import z from "zod";

export const genreSchema = z
  .object({
    name: z.string().min(5),
  })
  .strict();
// strict : tidak boleh valiadsi selain name

export const theaterSchema = z
  .object({
    name: z.string().min(5),
    city: z.string().min(5),
  })
  .strict();
