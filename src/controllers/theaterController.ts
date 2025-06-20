import type { Request, Response } from "express";
import Theater from "../models/Theater";
import { theaterSchema } from "../utils/zodSchema";

export const getTheaters = async (req: Request, res: Response) => {
  try {
    const theaters = await Theater.find(); // membuat collection Theater find()

    return res.json({
      data: theaters,
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

export const getTheaterDetail = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // <- menggunakan destructuring assignment
    // sama seperti const id = req.params.id;
    // req.params adalah sebuah object
    // req.params = {
    //   id: "123",
    //   name: "fadel",
    // };

    const theater = await Theater.findById(id);

    return res.json({
      data: theater,
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

export const postTheater = async (req: Request, res: Response) => {
  try {
    // Validasi data dari API
    const body = theaterSchema.parse(req.body);

    const theater = new Theater({
      name: body.name,
      city: body.city,
    });

    // await memastikan proses ini selesai sebelum lanjut.
    // Menyimpan dokumen ke MongoDB, Konteks	Dipanggil dari instance model
    const newData = await theater.save(); // <- save() ini dari mongoose

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

export const putTheater = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const body = theaterSchema.parse(req.body);

    await Theater.findByIdAndUpdate(id, {
      name: body.name,
    });

    const updatedData = await Theater.findById(id);

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

export const deleteTheater = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedData = await Theater.findById(id);

    await Theater.findByIdAndDelete(id);

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
