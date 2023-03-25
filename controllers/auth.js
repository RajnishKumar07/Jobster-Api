const User = require("../models/user");

const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");

const { UnauthenticatedError, BadRequestError } = require("../errors");

const login = async (req, resp) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const token = user.createJWT();
  resp.status(StatusCodes.OK).json({
    user: {
      email: user.email,
      lastname: user.lastname,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

const register = async (req, resp) => {
  const user = await User.create({ ...req.body });
  const token = user.createJWT();
  resp.status(StatusCodes.CREATED).json({
    user: {
      email: user.email,
      lastname: user.lastname,
      location: user.location,
      name: user.name,
      token,
    },
  });
};

const updateUser = async (req, resp) => {
  const { email, name, lastname, location } = req.body;

  if (!email || !name || !lastname || !location) {
    throw new BadRequestError("Please provide all values");
  }
  const user = await User.findOne({ _id: req.user.userId });
  user.email = email;
  user.name = name;
  user.lastname = lastname;
  user.location = location;

  await user.save();
  const token = user.createJWT();
  resp.status(StatusCodes.OK).json({
    email: user.email,
    name: user.name,
    lastname: user.lastname,
    location: user.location,
    token,
  });
};
module.exports = {
  login,
  register,
  updateUser,
};
