const User = require('../models/userModal');
const AppError = require('../utils/appError');
const handler = require('./handlerFactory');

// function filterObj(body, ...rest) {

// }

exports.updateMe = async (req, res, next) => {
  if (req.body.email || req.body.password) {
    return next(new AppError('This is not for updating the password', 404));
  }

  // const filteredBody = filterObj(req.body, 'name', 'email');

  const currUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  res.status(200).json({
    status: 'success',
    data: currUser,
  });
};

exports.getAllUsers = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route not yet defined',
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route not yet defined',
  });
};
exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'This route not yet defined',
  });
};
exports.updateUser = handler.updateOne(User);
exports.deleteUser = handler.deleteOne(User);
