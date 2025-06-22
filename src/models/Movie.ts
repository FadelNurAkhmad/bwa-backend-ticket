import mongoose from "mongoose";
import { getAssetUrl } from "../utils/helper";
import Genre from "./Genre";
import Theater from "./Theater";

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    genre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Genre",
    },
    theaters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Theater",
      },
    ],
    description: {
      type: String,
      required: true,
    },
    // hanya menyimpan nama file (misalnya: poster1.jpg).
    thumbnail: {
      type: String,
      require: true,
    },
    price: Number,
    available: Boolean,
    bonus: String,
  },
  // Field Virtual thumbnailUrl Menambahkan Nama File
  // thumbnailUrl = "http://localhost:3000/uploads/thumbnails/poster1.jpg"
  // Kata kunci this adalah referensi ke object milik siapa
  // Virtual thumbnailUrl membentuk URL penuh agar bisa digunakan di frontend.
  {
    virtuals: {
      thumbnailUrl: {
        get() {
          return `${getAssetUrl()}${this.thumbnail}`;
        },
      },
    },
    // Dengan toJSON.virtuals: true, URL tersebut akan otomatis muncul saat data dikirim via API.
    toJSON: {
      virtuals: true,
    },
  }
);

// doc = yaitu dokumen Movie yang baru disimpan
// Ini adalah post-middleware, Dijalankan setelah movie.save() berhasil disimpan
movieSchema.post("save", async (doc) => {
  if (doc) {
    await Genre.findByIdAndUpdate(doc.genre, {
      $push: {
        movies: doc._id,
      },
    });

    for (const theater of doc.theaters) {
      await Theater.findByIdAndUpdate(theater._id, {
        $push: {
          movies: theater._id,
        },
      });
    }
  }
});

movieSchema.post("deleteOne", async (doc) => {
  if (doc) {
    await Genre.findByIdAndUpdate(doc.genre, {
      $pull: {
        movies: doc._id,
      },
    });

    for (const theater of doc.theaters) {
      await Theater.findByIdAndUpdate(theater._id, {
        $pull: {
          movies: theater._id,
        },
      });
    }
  }
});

export default mongoose.model("Movie", movieSchema, "movies");
