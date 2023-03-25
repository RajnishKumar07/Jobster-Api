const express = require("express");
const router = express.Router();
const { login, register, updateUser } = require("../controllers/auth");
const authenticationMiddleware = require("../middlewares/auth");
const testUser = require("../middlewares/testUser");

const rateLimiter = require("express-rate-limit");

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: {
    msg: "Too many requests from this IP,Please try again after 15 minutes",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

router.route("/login").post(apiLimiter, login);
router.route("/register").post(apiLimiter, register);
router.patch("/updateUser", authenticationMiddleware, testUser, updateUser);

module.exports = router;
