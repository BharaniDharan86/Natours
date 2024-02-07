const multer = require('multer');
const User = require('../models/userModal');
const AppError = require('../utils/appError');
const handler = require('./handlerFactory');

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/img/users');
  },
  filename: (req, file, cb) => {
    const fileExt = file.mimetype.split('/')[1];
    const ext = `user-${req.user.id}-${Date.now()}.${fileExt}`;

    cb(null, ext);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('should be a images'));
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) {
    return next();
  }
};

exports.updateMe = async (req, res, next) => {
  if (req.file) {
    req.body.photo = req.file.filename;
  }

  if (req.body.email || req.body.password) {
    return next(new AppError('This is not for updating the password', 404));
  }

  console.log(req.body);

  const currUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      photo: req.body.photo,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  return res.status(200).json({
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
