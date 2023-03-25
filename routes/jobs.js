const express = require("express");
const router = express.Router();
const testUser = require("../middlewares/testUser");
const {
  getAllJobs,
  getJob,
  createJob,
  updateJobs,
  deleteJobs,
  showStats,
} = require("../controllers/jobs");

router.route("/").get(getAllJobs).post(testUser, createJob);
router.route("/stats").get(showStats);

router
  .route("/:id")
  .get(getJob)
  .patch(testUser, updateJobs)
  .delete(testUser, deleteJobs);

module.exports = router;
