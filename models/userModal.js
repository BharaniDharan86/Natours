/* eslint-disable radix */
const mongoose = require('mongoose');
const Validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: true,
    unique: [true, 'Please provide your email Id'],
    lowercase: true,
    validate: [Validator.isEmail, 'Please provide valid email address'],
  },
  role: {
    type: String,
    default: 'user',
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be atleast 8 character'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password should be Same !!!',
    },
  },
  passwordChangedAt: Date,
  passwordChangeToken: String,
  passwordChangeTokenExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 2000;
  next();
});

userSchema.methods.checkPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.isPasswordChanged = function (timeStamp) {
  if (this.passwordChangedAt) {
    return timeStamp < parseInt(this.passwordChangedAt.getTime() / 1000);
  }
  return false;
};

userSchema.methods.passwordResetToken = function (req, res, next) {
  //generate random string
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordChangeToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordChangeTokenExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
