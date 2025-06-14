import type { Request, Response } from "express";
import Genre from "../models/Genre";

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
