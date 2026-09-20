import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tourModels';
import { APIFeatures } from '../utils/apiFeatures';

interface Tour {
  id: number;
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  startDates: string[];
}

const aliasTopTour = (req: Request, res: Response, next: NextFunction) => {
  // Express 5: req.query is a getter that re-parses req.url on every access.
  // Mutating req.query.limit (etc.) only changes a throwaway object, so
  // rewrite the query string instead.
  req.url = `${req.path}?limit=5&sort=-ratingsAverage,price&fields=name,price,ratingsAverage,difficulty`;

  next();
};

const getAllTours = async (req: Request, res: Response) => {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    // Execute Query
    const tours = await features.query;

    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'fail',
      message: err instanceof Error ? err.message : String(err),
    });
  }
};

const getTour = async (req: Request, res: Response) => {
  try {
    const tour = await Tour.findOne({ _id: req.params.id });
    // const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const createTour = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err: any) {
    res.status(400).json({
      status: 'fail',
      message: err.errorResponse.errmsg,
    });
  }
};

const updateTour = async (req: Request, res: Response) => {
  try {
    const updateTour = await Tour.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    res.status(200).json({
      status: 'success',
      data: {
        tour: updateTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const deleteTour = async (req: Request, res: Response) => {
  try {
    const deletedTour = await Tour.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: 'success',
      message: 'data deleted',
      data: {
        deletedTour: deletedTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const getTourStats = async (req: Request, res: Response) => {
  try {
    const stats = await Tour.aggregate([
      { $match: { ratingsAverage: { $gte: 4.5 } } },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          names: { $push: '$name' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      //   $match: { _id: { $ne: 'EASY' } },
      // },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats: stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

const getMonthlyPlan = async (
  req: Request<{ year: string }>,
  res: Response,
) => {
  try {
    const year = parseInt(req.params.year, 10); //2021
    const monthlyPlan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTours: { $sum: 1 },
          // tours: { $push: '$$ROOT' },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: { _id: 0 },
      },
      {
        $sort: { numTours: -1 },
      },
    ]);
    res.status(200).json({
      status: 'success',
      totalTours: monthlyPlan.length,
      data: {
        monthlyPlan: monthlyPlan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

export default {
  getTour,
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTour,
  getTourStats,
  getMonthlyPlan,
};
