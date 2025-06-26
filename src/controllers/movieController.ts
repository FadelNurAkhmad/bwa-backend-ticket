import type { Request, Response } from "express";
import Movie from "../models/Movie";
import { movieSchema } from "../utils/zodSchema";

export const getMovies = async (req: Request, res: Response) => {
  try {
    const movies = await Movie.find()
      .populate({
        path: "genre",
        select: "name",
      })
      .populate({
        path: "theaters",
        select: "name",
      });
    // populate() -> Mongoose (Query), Mengisi field referensi (genre, theaters) dengan dokumen aslinya
    // Fungsi: Mengambil referensi dokumen dari koleksi lain (Genre), berdasarkan relasi di field genre

    return res.json({
      data: movies,
      message: "Success get data",
      status: "Success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to get data",
      data: null,
      status: "failed",
    });
  }
};

export const createMovie = async (req: Request, res: Response) => {
  try {
    // Menerima file thumbnail (req.file)
    if (!req.file) {
      return res.status(400).json({
        message: "Thumbnail is required",
        data: null,
        status: "failed",
      });
    }

    // Menerima data movie dari form (via req.body)
    // Validasi data dengan Zod schema (movieSchema)
    // safeParse() = Mengecek apakah data sesuai schema
    const parse = movieSchema.safeParse({
      title: req.body.title,
      genre: req.body.genre,
      theaters: req.body.theaters.split(","), // Ubah string "a,b,c" menjadi array ["a", "b", "c"]
      // biome-ignore lint/complexity/noUselessTernary: for data insert
      available: req.body.available === "1" ? true : false, // Ubah string "1" menjadi boolean true
      description: req.body.description,
      price: Number.parseInt(req.body.price), // Ubah string angka menjadi number
      bonus: req.body?.bonus,
    });

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      return res.status(400).json({
        message: "Invalid request",
        details: errorMessages,
        status: "failed",
      });
    }

    const movie = new Movie({
      title: parse.data.title,
      genre: parse.data.genre,
      available: parse.data.available,
      theaters: parse.data.theaters,
      thumbnail: req.file?.filename,
      description: parse.data.description,
      price: parse.data.price,
      bonus: parse.data.bonus,
    });

    await movie.save();

    return res.json({
      status: "success",
      data: movie,
      message: "Success create data",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to create data",
      data: null,
      status: "failed",
    });
  }
};
