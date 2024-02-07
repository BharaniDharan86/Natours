/* eslint-disable prefer-arrow-callback */
const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = mongoose.Schema({
  review: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
  },
  createdAt: Date,
  tour: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
    },
  ],
  user: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  ],
});

reviewSchema.pre(/^find/, function (next) {
  this.populate('user');
  next();
});

//static methods
reviewSchema.statics.calcAverage = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: {
        tour: tourId,
      },
    },
    {
      $group: {
        _id: '$tour',
        numReviews: {
          $sum: 1,
        },
        averageRating: {
          $avg: '$rating',
        },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].averageRating,
    ratingQuantity: stats[0].numReviews,
  });
};

//while creating the new reviews
reviewSchema.post('save', function () {
  this.constructor.calcAverage(this.tour);
});

//while updating and deleting
reviewSchema.post(/^findOneAnd/, async function (docs) {
  await docs.constructor.calcAverage(docs.tour);
});

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
const Review = mongoose.model('reviews', reviewSchema);

module.exports = Review;
