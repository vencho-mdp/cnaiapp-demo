const express = require("express");
const {
  get_students,
  add_students_that_were_absent,
  get_absent_students,
  get_suspicious_cases,
  get_late_students,
  get_student_absence_dates,
  get_checked_classes,
  add_checked_classes,
  get_student_grades,
} = require("../controllers/students");
const auth = require("../middlewares/auth");

const router = express.Router();

router.get(
  "/students",
  (req, res, next) =>
    auth(req, res, next, ["management_team", "preceptor", "teacher"]),
  get_students
);

router.post(
  "/absent-students",
  (req, res, next) =>
    auth(req, res, next, ["management_team", "preceptor", "teacher"]),
  add_students_that_were_absent
);

router.get(
  "/absent-students",
  (req, res, next) =>
    auth(req, res, next, ["management_team", "preceptor", "teacher"]),
  get_absent_students
);

router.get(
  "/students-absence-suspicious-cases",
  (req, res, next) => auth(req, res, next, ["management_team"]),
  get_suspicious_cases
);

router.get(
  "/late-students",
  (req, res, next) =>
    auth(req, res, next, ["management_team", "preceptor", "teacher"]),
  get_late_students
);

router.get(
  "/student-absence-dates",
  (req, res, next) =>
    auth(req, res, next, ["management_team", "preceptor", "teacher"]),
  get_student_absence_dates
);

router.get(
  "/checked-classes",
  (req, res, next) =>
    auth(req, res, next, ["management_team", "preceptor", "teacher"]),
  get_checked_classes
);

router.post(
  "/checked-classes",
  (req, res, next) =>
    auth(req, res, next, ["management_team", "preceptor", "teacher"]),
  add_checked_classes
);

router.get(
  "/students/:student_id/grades",
  (req, res, next) => auth(req, res, next, ["student"]),
  get_student_grades
);

module.exports = router;
