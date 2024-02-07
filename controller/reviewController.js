const Review = require('../models/reviewModal');
const handler = require('./handlerFactory');

exports.getAllReviews = async (req, res, next) => {
  const reviews = await Review.find()
    .populate({
      path: 'tour',
    })
    .populate({
      path: 'user',
    });

  return res.status(200).json({
    status: 'Success',
    reviews,
  });
};

exports.setTourId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;

  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.createReview = handler.createOne(Review);

exports.updateReview = handler.updateOne(Review);
exports.deleteReview = handler.deleteOne(Review);
