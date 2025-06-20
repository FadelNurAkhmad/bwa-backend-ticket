import type { NextFunction, Request, Response } from "express";
import type z from "zod";
import { ZodError } from "zod";

// schema: z.AnyZodObject	Membatasi parameter hanya skema Zod bertipe objek
export const validateRequest =
  (schema: z.AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // validasi req.body sesuai zod schema
      schema.parse(req.body);
      next(); // lanjut ke controller
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => err.message);

        console.log(error);

        return res.status(500).json({
          error: "Invalid request",
          details: errorMessages,
        });
      }

      return res.status(500).json({ error: "Internal server error" });
    }
  };
