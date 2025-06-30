import type { Request, Response } from "express";
import Movie from "../models/Movie";
import Genre from "../models/Genre";
import Transaction from "../models/Transaction";

export const getMovies = async (req: Request, res: Response) => {
  try {
    const data = await Movie.find() // -> Ambil semua dokumen dari koleksi movies. Mengembalikan array dokumen film.
      .select("title thumbnail") // -> .select() adalah metode dari Mongoose untuk menentukan field mana yang akan diambil.
      // Di sini hanya mengambil title dan thumbnail dari setiap movie
      .populate({
        // .populate() → mengambil data relasi dari koleksi lain (di sini: genre)
        path: "genre", // path: "genre" → artinya field genre di model Movie adalah sebuah referensi ke koleksi Genre.
        select: "name -_id", // select: "name -_id" → hanya ambil field name dari dokumen genre, dan jangan tampilkan _id.
      })
      .limit(3); // .limit(3) → hanya ambil maksimal 3 film saja
    // contoh hasil dokumen
    //   {
    //     "title": "Inception",
    //     "thumbnail": "inception.jpg",
    //     "genre": {
    //       "name": "Sci-Fi"
    //     }
    //   }

    return res.json({
      data: data,
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

export const getGenre = async (req: Request, res: Response) => {
  try {
    const genres = await Genre.find().select("name").limit(3);
    // Genre.find() → ambil semua data genre.
    // .select("name") → hanya ambil field name, id tetap ditampilkan default.
    //  .limit(3) → batasi hasil ke 3 data genre

    return res.json({
      data: genres,
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

export const getMovieDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const seats = [];

    // Loop untuk membuat kursi A1–A5 (belum dipesan)
    for (let i = 0; i < 5; i++) {
      seats.push({
        seat: `A${i + 1}`,
        isBooked: false,
      });
    }

    for (let i = 0; i < 5; i++) {
      seats.push({
        seat: `B${i + 1}`,
        isBooked: false,
      });
    }

    for (let i = 0; i < 5; i++) {
      seats.push({
        seat: `C${i + 1}`,
        isBooked: false,
      });
    }

    const movie = await Movie.findById(id)
      .populate({
        path: "theaters",
        select: "name city", // Ambil hanya field name dan city dari teater
      })
      .populate({
        path: "genre",
        select: "name -_id", // Ambil hanya field name, dan buang _id (- artinya exclude)
      });

    // optional chaining (?.) agar tidak error jika movie bernilai null atau undefined
    // ...movie -> menguraikan properti dari objek movie ke dalam objek baru (spread operator)
    return res.json({
      data: {
        movie: {
          ...movie?.toJSON(), // movie?.toJSON() → ubah dokumen Mongoose menjadi object biasa (agar bisa disisipkan seats dan times)
          seats, // array dummy kursi bioskop
          times: ["12:30", "14:50", "18:30", "22:30", "23:30"], // array waktu tayang (statis, bukan dari DB)
        },
      },
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

export const getAvailableSeats = async (req: Request, res: Response) => {
  try {
    const { movieId } = req.params; // movieId diambil dari parameter URL, misalnya /seats/665abc12345
    const { date } = req.query; // mengambil data query parameter
    // date diambil dari query string, misalnya ?date=2024-06-28+14:30

    const transactions = await Transaction.find({
      date: date?.toString().replace("+", " "), // ubah + jadi spasi agar cocok dengan format di database
      // contoh: "2024-06-28+14:30" menjadi "2024-06-28 14:30"
      movie: movieId,
    })
      .select("seats") // Ambil hanya field seats dari transaction (tidak perlu field lain seperti user, total, dll)
      .populate({
        path: "seats",
        select: "seat",
      });
    // seats di model Transaction adalah referensi ke koleksi transactionSeats
    // Dengan populate, kita ambil objek kursi (misalnya: { seat: "A3" }) alih-alih hanya ObjectId-nya

    const seats = [];

    for (const seat of transactions) {
      seats.push(...seat.seats);
    }
    // Tambahkan semua kursi dari transaction ke array seats menggunakan spread (...) karena seat.seats adalah array

    return res.json({
      data: seats,
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
