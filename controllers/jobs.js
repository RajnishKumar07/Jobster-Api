const Job = require("../models/job");
const { StatusCodes } = require("http-status-codes");
const NotFoundError = require("../errors/not-found");
const { BadRequestError } = require("../errors");
const mongoose = require("mongoose");
const moment = require("moment");

const getAllJobs = async (req, resp) => {
  const { search, status, jobType, sort } = req.query;
  //Query object for search
  const queryObject = {
    createdBy: req.user.userId,
  };

  //set condition for searching
  if (search) {
    queryObject.position = { $regex: search, $options: "i" };
  }
  if (status && status !== "all") {
    queryObject.status = status;
  }
  if (jobType && jobType !== "all") {
    queryObject.jobType = jobType;
  }

  let result = Job.find(queryObject);

  //sorting the data
  if (sort === "latest") {
    result = result.sort("-createdAt");
  }
  if (sort === "oldest") {
    result = result.sort("createdAt");
  }
  if (sort === "a-z") {
    result = result.sort("position");
  }
  if (sort === "z-a") {
    result = result.sort("-position");
  }

  //Pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const allJobs = await result;
  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = await Math.ceil(totalJobs / limit);

  resp.status(StatusCodes.OK).json({
    jobs: allJobs,
    totalJobs,
    numOfPages,
  });
};

const getJob = async (req, resp) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;
  const job = await Job.findOne({ _id: jobId, createdBy: userId });
  if (!job) {
    throw new NotFoundError(`No job found with id ${jobId}`);
  }
  resp.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, resp) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);

  resp.status(StatusCodes.CREATED).json(job);
};

const deleteJobs = async (req, resp) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOneAndRemove({ _id: jobId, createdBy: userId });
  if (!job) {
    throw new NotFoundError(`No job found with id ${jobId}`);
  }
  resp.status(StatusCodes.OK).json();
};

const updateJobs = async (req, resp) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;
  if (company === "" || position === "") {
    throw new BadRequestError("Company or Position field can not be empty");
  }
  const job = await Job.findOneAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!job) {
    throw new NotFoundError(`No job found with id ${jobId}`);
  }
  resp.status(StatusCodes.OK).json({ job });
};

const showStats = async (req, resp) => {
  let stats = await Job.aggregate([
    {
      $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) },
    },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});
  const defaultStats = {
    declined: stats.declined || 0,
    interview: stats.interview || 0,
    pending: stats.pending || 0,
  };

  let monthlyApplications = await Job.aggregate([
    {
      $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) },
    },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },

    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");
      return { date, count };
    })
    .reverse();
  resp.status(StatusCodes.OK).json({
    defaultStats,
    monthlyApplications,
  });
};

module.exports = {
  getAllJobs,
  getJob,
  createJob,
  deleteJobs,
  updateJobs,
  showStats,
};
