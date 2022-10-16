const express = require("express");
const auth = require("../middlewares/auth");
const {
  addEvaluativeActivity,
  getEvaluativeActivities,
  updateGrades,
  updateEvaluativeActivity,
} = require("../controllers/evaluative_activity");

const router = express.Router();

router.post(
  "/evaluative-activities",
  (req, res, next) => auth(req, res, next, ["teacher"]),
  addEvaluativeActivity
);

router.get(
  "/evaluative-activities",
  (req, res, next) => auth(req, res, next, ["teacher"]),
  getEvaluativeActivities
);

router.put(
  "/evaluative-activities/grades",
  (req, res, next) => auth(req, res, next, ["teacher"]),
  updateGrades
);

router.put(
  "/evaluative-activities",
  (req, res, next) => auth(req, res, next, ["teacher"]),
  updateEvaluativeActivity
);
module.exports = router;
