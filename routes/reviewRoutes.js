const express = require('express');

const {
  getAllReviews,
  createReview,
  setTourId,
  updateReview,
  deleteReview,
} = require('../controller/reviewController');
const authController = require('../controller/authController');

const { restrictTo } = require('../controller/tourController');

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.use(authController.protect);

reviewRouter
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), authController.protect, setTourId, createReview);

reviewRouter.route('/:id').patch(updateReview, deleteReview);
module.exports = reviewRouter;
