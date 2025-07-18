import type { Request, Response } from "express";
import Genre from "../models/Genre";
import { genreSchema } from "../utils/zodSchema";

export const getGenres = async (req: Request, res: Response) => {
  try {
    const genres = await Genre.find();

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

export const getGenreDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // <- menggunakan destructuring assignment
    // sama seperti const id = req.params.id;
    // req.params adalah sebuah object
    // req.params = {
    //   id: "123",
    //   name: "fadel",
    // };

    const genre = await Genre.findById(id);

    return res.json({
      data: genre,
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

export const postGenre = async (req: Request, res: Response) => {
  try {
    // Validasi data dari API
    const body = genreSchema.parse(req.body);

    const genre = new Genre({
      name: body.name,
    });

    // await memastikan proses ini selesai sebelum lanjut.
    // Menyimpan dokumen ke MongoDB, Konteks	Dipanggil dari instance model
    const newData = await genre.save(); // <- save() ini dari mongoose

    return res.json({
      message: "Success create data",
      data: newData,
      status: "success",
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

export const putGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const body = genreSchema.parse(req.body);

    await Genre.findByIdAndUpdate(id, {
      name: body.name,
    });

    const updatedData = await Genre.findById(id);

    return res.json({
      message: "Success update data",
      data: updatedData,
      status: "success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to update data",
      data: null,
      status: "failed",
    });
  }
};

export const deleteGenre = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedData = await Genre.findById(id);

    await Genre.findByIdAndDelete(id);

    return res.json({
      message: "Success delete data",
      data: deletedData,
      status: "success",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Failed to delete data",
      data: null,
      status: "failed",
    });
  }
};
