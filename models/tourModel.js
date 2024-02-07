/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Must have a name '],
      unique: true,
      minlength: [6, 'A name must have 6 characters'],
      maxlength: [40, 'A name must be less than 40 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'A Tour must have Duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A Tour Must have Number Of People'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      // enum: {
      //   value: ['easy', 'medium', 'difficulty'],
      //   message: 'easy or medium or difficulty',
      // },
    },
    ratingsAverage: {
      type: Number,
      default: 1,
      min: [1, 'Tour rating atleast 1 star'],
      max: [5, 'Tour rating atleast 5 star'],
    },
    ratingQuantity: {
      type: Number,
    },
    price: {
      type: Number,
      required: [true, 'Tour Must Have Price'],
    },
    priceDiscount: {
      type: Number,
    },
    summary: {
      type: String,
      //remove the whitespace in the front and beginning
      trim: true,
      required: [true, 'A Summary is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A img Cover is Required'],
    },

    secretTour: {
      type: Boolean,
      default: false,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    //THIS OBJECT IS EMBED PROPERTY
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },

    locations: {
      type: {
        type: String,
        default: 'Point',
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },

    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  },
);

tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('weeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'reviews',
  foreignField: 'tour',
  localField: '_id',
});

//QUERY
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: ' -__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  // console.log(`Query took ${Date.now() - this.start} ms`);
  next();
});

//AGGREGATE

tourSchema.pre('aggregate', function (next) {
  // console.log(this.pipeline());
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

//DOCUMENT

tourSchema.pre('save', function (next) {
  // eslint-disable-next-line no-console
  console.log('will be save in minute');
  next();
});

tourSchema.post('save', function (docs, next) {
  // eslint-disable-next-line no-console
  console.log('s uccessfully saved to db!!!');
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
