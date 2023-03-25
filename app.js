require("dotenv");
require("express-async-errors");
require("dotenv").config();

//extra security packages
const helmet = require("helmet");
const xss = require("xss-clean");

const connectDB = require("./db/connect");
const express = require("express");
const app = express();
const authRouter = require("./routes/auth");
const jobsRouter = require("./routes/jobs");

//error handler
const errorHandlerMiddleware = require("./middlewares/error-handler");
const notFoundMiddleware = require("./middlewares/not-found");
const authenticationMiddleware = require("./middlewares/auth");

app.set("trust proxy", 1);

//extra package
app.use(express.json());
app.use(helmet());
app.use(xss());

//routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticationMiddleware, jobsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, console.log(`Server is listening on Port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};
start();
