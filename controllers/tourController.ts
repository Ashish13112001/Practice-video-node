import { Request, Response, NextFunction } from 'express';
import Tour from '../models/tourModels';

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

// const __filename = fileURLToPath(import.meta.url); //It provide file complete path
// const __dirname = path.dirname(__filename); //It provide current file folder path

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'),
// );

// const checkID = (
//   req: Request,
//   res: Response,
//   next: NextFunction,
//   val: string,
// ) => {
//   console.log(`This is Params router for idL ${val}`);
//   next();
// };

// const checkBody = (req: Request, res: Response, next: NextFunction) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'missing name or price',
//       data: 'data',
//     });
//   }
//   next();
// };

const getAllTours = async (req: Request, res: Response) => {
  try {
    console.log('req.query ==> ', req.query);

    // Build Query

    // 1.A) Filtering
    const queryObj = { ...req.query };

    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    // 1.B) Advanced Filtering
    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    console.log('queryStr ==> ', queryStr);

    let query = Tour.find(JSON.parse(queryStr));

    // 2) Sorting
    if (req.query.sort) {
      console.log('---sort----', req.query.sort);
      // const sortString = req.query.sort.replaceAll(',', ' ');
      const sortString = req.query.sort.split(',').join(' ');
      console.log('---sortString----', sortString, typeof sortString);
      query = query.sort(sortString);
    } else {
      query = query.sort('-createdAt');
    }

    // 3) Field Limiting
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v');
    }

    // 4) Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    if (req.query.page) {
      const numTours = await Tour.countDocuments();
      if (skip >= numTours) throw new Error('This page does not exist');
    }

    // Execute Query
    const tours = await query;

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

export default {
  getTour,
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  // checkID,
  // checkBody,
};
