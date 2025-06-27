import type { Request, Response } from "express";
import Movie from "../models/Movie";
import { movieSchema } from "../utils/zodSchema"; // Validasi Zod
import path from "node:path"; // Manipulasi path file/direktori // Library bawaan Node.js
import fs from "node:fs"; // Interaksi dengan sistem file (baca, tulis, hapus) // Library bawaan Node.js
import Genre from "../models/Genre"; // Model Mongoose
import Theater from "../models/Theater";

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

export const updateMovie = async (req: Request, res: Response) => {
  try {
    // 1️⃣ Ambil ID movie dari parameter URL (/movies/:id)
    const { id } = req.params;

    // 2️⃣ Validasi dan parsing input dari body menggunakan Zod
    const parse = movieSchema.safeParse({
      title: req.body.title,
      genre: req.body.genre,
      theaters: req.body.theaters.split(","),
      // biome-ignore lint/complexity/noUselessTernary: for data insert
      available: req.body.available === "1" ? true : false,
      description: req.body.description,
      price: Number.parseInt(req.body.price),
      bonus: req.body?.bonus,
    });

    // 3️⃣ Jika validasi gagal → kirim error 400
    if (!parse.success) {
      const errorMessages = parse.error.issues.map((err) => err.message);

      return res.status(400).json({
        message: "Invalid request",
        details: errorMessages,
        status: "failed",
      });
    }

    // 4️⃣ Ambil data movie lama dari database
    const oldMovie = await Movie.findById(id);

    // 5️⃣ Jika data tidak ditemukan → kirim error
    if (!oldMovie) {
      return res.status(400).json({
        message: "Data movie not found",
        status: "failed",
        data: null,
      });
    }

    // 6️⃣ Jika ada file thumbnail baru dikirim...
    if (req.file) {
      const dirname = path.resolve(); // Ambil direktori root path // "D:/Belajar JavaScript Dasar/bwa-backend-ticket"
      // path.join() dari Node.js → membentuk path file dengan aman lintas OS
      // D:/Belajar JavaScript Dasar/bwa-backend-ticket/public/uploads/thumbnails/avengers.jpg
      const filepath = path.join(
        dirname,
        "public/uploads/thumbnails",
        oldMovie.thumbnail ?? "" // oldMovie.thumbnail adalah "avengers.jpg"
      );

      // 6a. Jika file lama ada → hapus file thumbnail lama
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath); // fs.unlinkSync() dari Node.js → untuk hapus file thumbnail lama dari disk
      }
    }

    // 7️⃣ Hapus relasi film lama dari genre lama
    await Genre.findByIdAndUpdate(oldMovie.genre, {
      $pull: {
        movies: oldMovie._id, // hapus ID movie dari array genre.movies
      },
    });

    // 8️⃣ Hapus relasi film lama dari setiap teater lama
    for (const theater of oldMovie.theaters) {
      // .findByIdAndUpdate() dari Mongoose → update dokumen berdasarkan ID
      await Theater.findByIdAndUpdate(theater._id, {
        $pull: {
          movies: oldMovie._id, // hapus ID movie dari array theater.movies
        },
      });
    }

    // 9️⃣ Update data movie ke MongoDB
    await Movie.findByIdAndUpdate(oldMovie._id, {
      title: parse.data.title,
      genre: parse.data.genre,
      available: parse.data.available,
      theaters: parse.data.theaters,
      thumbnail: req?.file ? req.file.filename : oldMovie.thumbnail, // jika ada file baru, pakai yang baru
      description: parse.data.description,
      price: parse.data.price,
      bonus: parse.data.bonus,
    });

    // 🔟 Tambahkan kembali relasi ke genre baru
    await Genre.findByIdAndUpdate(parse.data.genre, {
      $push: {
        movies: id,
      },
    });

    // 1️⃣1️⃣ Tambahkan relasi ke theaters baru
    for (const theater of parse.data.theaters) {
      await Theater.findByIdAndUpdate(theater, {
        $push: {
          movies: id,
        },
      });
    }

    // 1️⃣2️⃣ Ambil data movie yang sudah diperbarui
    const updatedMovie = await Movie.findById(id);

    // 1️⃣3️⃣ Kirim response sukses ke client
    return res.json({
      status: "success",
      data: updatedMovie,
      message: "Success update data",
    });
  } catch (error) {
    // 🧯 Error internal server
    console.log(error);
    return res.status(500).json({
      message: "Failed to update data",
      data: null,
      status: "failed",
    });
  }
};
