const express = require("express");
const router = express.Router();
const {
  getJobs,
  getInterviews,
  createJob,
  updateJob,
  deleteJob,
  updateJobStatus,
} = require("../controllers/jobController");
const { protect } = require("../middleware/authMiddleware");

// All job routes are protected
router.use(protect);

// Must be before /:id routes to avoid conflict
router.get("/interviews", getInterviews);

router.route("/").get(getJobs).post(createJob);
router.route("/:id").put(updateJob).delete(deleteJob);
router.patch("/:id/status", updateJobStatus);

module.exports = router;
