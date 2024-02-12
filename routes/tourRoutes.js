/* eslint-disable import/no-useless-path-segments */
const express = require('express');

const tourRouter = express.Router();
const reviewRouter = require('../routes/reviewRoutes');

const tourController = require('../controller/tourController');
const authController = require('../controller/authController');

// const reviewController = require('../controller/reviewController');
//PARAMS MIDDLEWARE

// tourRouter.param('id', tourController.checkId);

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter
  .route('/top-5-cheap')
  .get(tourController.getInfo, tourController.getAlltours);

tourRouter
  .route('/')
  .get(tourController.getAlltours)
  .post(
    authController.protect,
    tourController.restrictTo('admin', 'lead-guides'),
    tourController.createTour,
  );

tourRouter
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getAllWithin);

tourRouter
  .route('/tours-monthly/:year')
  .get(
    authController.protect,
    tourController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

tourRouter.route('/tours-stats').get(tourController.getTourStats);
tourRouter
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    tourController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.uploadTourImages,
    tourController.renameImageCover,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    tourController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );

// tourRouter
//   .route('/:tourId/reviews')
//   .post(authController.protect, reviewController.createReview);

module.exports = tourRouter;
