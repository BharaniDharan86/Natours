const express = require('express');

const userRouter = express.Router();
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const {
  uploadUserPhoto,
  resizeUserPhoto,
} = require('../controller/userController');

userRouter.post('/signup', authController.createUser);

userRouter.post('/login', authController.login);

userRouter.post('/forgotpassword', authController.forgetPassword);

userRouter.post('/resetpassword/:token', authController.reset);

userRouter.use(authController.protect);

userRouter.post(
  '/updatePassword',
  authController.protect,
  authController.updatePassword,
);

userRouter.patch(
  '/updateme',
  authController.protect,
  uploadUserPhoto,
  resizeUserPhoto,
  userController.updateMe,
);

userRouter
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
