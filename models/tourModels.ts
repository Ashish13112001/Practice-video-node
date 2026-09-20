import mongoose, { Schema, Document } from 'mongoose';
import slugify from 'slugify';

interface ITour extends Document {
  name: string;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  ratingsAverage: number;
  ratingsQuantity: number;
  price: number;
  priceDiscount?: number;
  summary: string;
  description: string;
  imageCover: string;
  images: string[];
  createdAt: Date;
  startDates: Date[];
  slug: string;
  secretTour: boolean;
}

const tourSchema = new Schema<ITour>(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [
        40,
        'A tour name must have less or equall then 40 characters',
      ],
      minlength: [
        10,
        'A tour name must have greater or equall to 10 characters',
      ],
    },

    slug: {
      type: String,
      unique: true,
    },

    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },

    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },

    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult',
      },
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must have above 1.0'],
      max: [5, 'rating must have below 5.0'],
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },

    priceDiscount: {
      type: Number,
      validate: {
        validator: function(this: ITour,val){
          //we use npm library for validation//
          //this only point to current doc on NEW document creation
            return val < this.price;
        },
        message: 'Discount price should be below regular price'
      }
    },

    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'A tour must have a description'],
      trim: true,
    },

    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },

    images: [String],

    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },

    startDates: [Date],

    secretTour: {
      type: Boolean,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
// Mongoose 9: pre('save') is promise-based; the first arg is SaveOptions, not next().
tourSchema.pre('save', function () {
  this.slug = slugify(this.name, { lower: true });
});

// tourSchema.pre('save', function () {
//   console.log('this----------', this);
// })

// tourSchema.post('save', function (doc) {
//   console.log('doc----------', doc);
// });

//Query Middleware
// this will only for find and if we want that all the query start from find use regular expression
// tourSchema.pre(/^find/, function () {
tourSchema.pre('find', function () {
  this.find({ secretTour: { $ne: true } });
});

//Aggregation middleware
tourSchema.pre('aggregate', function () {
  this.pipeline().unshift({
    $match: {
      secretTour: { $ne: true },
    },
  });

  console.log('aggregation pipeline: ', this.pipeline());
});

const Tour = mongoose.model<ITour>('Tour', tourSchema);

export default Tour;
