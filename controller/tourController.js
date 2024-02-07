/* eslint-disable arrow-body-style */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
/* eslint-disable node/no-unsupported-features/es-syntax */
const APIFEATURE = require('../utils/apifeature');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handler = require('./handlerFactory');

exports.getInfo = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price';
  next();
};

const createAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch(next);
  };
};

exports.getAlltours = catchAsync(async (req, res) => {
  const features = new APIFEATURE(Tour.find(), req.query)
    .filter()
    .sortBy()
    .field();
  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    result: tours.length,
    data: {
      tours,
    },
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tour = await Tour.findById(id).populate({
    path: 'reviews',
  });

  if (!tour) {
    return next(new AppError('Cannot find the tour with this id', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

exports.createTour = handler.createOne(Tour);
exports.updateTour = handler.updateOne(Tour);
exports.deleteTour = handler.deleteOne(Tour);

exports.getTourStats = async (req, res) => {
  try {
    const Stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4 },
        },
      },
      {
        $group: {
          //You just need to pass _id as the first field while use $group.
          _id: null,
          numTours: {
            $sum: 1,
          },
          avgRating: {
            $avg: '$ratingsAverage',
          },
          avgPrice: {
            $avg: '$price',
          },

          minPrice: {
            $min: '$price',
          },
          maxPrice: {
            $max: '$price',
          },
        },
      },
      {
        $sort: {
          minPrice: -1,
        },
      },
    ]);

    res.status(200).json({
      status: 'Success',
      data: {
        Stats,
      },
    });
  } catch (error) {
    res.status(400).send({
      status: 'failed',
      message: error,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  const year = req.params.year * 1;
  try {
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
          _id: {
            $month: '$startDates',
          },
          numOfToursStarts: { $sum: 1 },
          tours: {
            $push: '$name',
          },
        },
      },
      {
        $addFields: {
          month: '$_id',
        },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: {
          numOfToursStarts: -1,
        },
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: { monthlyPlan },
    });
  } catch (error) {
    res.status(400).send({
      status: 'failed',
      message: error,
    });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You dont have the permission to delete tours', 403),
      );
    }
    next();
  };
};

exports.getAllWithin = async (req, res, next) => {
  ///tours-within/:distance/center/:latlng/unit/:unit
  const { distance, latlng, unit } = req.params;
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  const [lat, lng] = latlng.split(',');

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
      ),
    );
  }

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  return res.status(200).json({
    status: 'success',
    results: tours.length,
    tours,
  });
};

// const currentTour = tours.find((tour) => tour.id === id);

// if (!currentTour) {
//   res.send(`Couldn't find tour with the id of ${id}`);
// } else {
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour: currentTour,
//     },
//   });
// }

/** const tourToUpdate = tours.find((tour) => tour.id === id);
  const updatedTour = { ...tourToUpdate, ...req.body };
  tours[id] = updatedTour; 
  
  // fs.writeFile(
  //   `${__dirname}/dev-data/data/tours-simple.json`,
  //   JSON.stringify(tours),
  //   (err) => {
  //     res.status(201).json({
  //       status: 'success',
  //       data: {
  //         tours: updatedTour,
  //       },
  //     });
  //   },
  // );
  
  
  
  exports.checkId = (req, res, next, value) => {
  if (value >= tours.length) {
    return res.status(404).send({
      status: 'error',
      message: 'invalid id',
    });
  }

  next();


};

exports.checkBody = (req, res, next) => {
  if (!req.body.price || !req.body.name) {
    return res.status(400).json({
      status: 'error',
      message: 'invalid body property',
    });
  }
  next();
};*/
