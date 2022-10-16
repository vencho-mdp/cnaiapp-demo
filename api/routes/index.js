const express = require("express");
const slots = require("./slots");
const classes = require("./classes");
const auth = require("./auth");
const teachers_absence = require("./teachers_absence");
const teachers = require("./teachers");
const news = require("./news");
const subjects = require("./subjects");
const events = require("./events");
const bugs = require("./bugs");
const students = require("./students");
const user = require("./user");
const evaluative_activity = require("./evaluative_activity");

const router = express.Router();

router.use(slots);
router.use(classes);
router.use(auth);
router.use(teachers_absence);
router.use(teachers);
router.use(news);
router.use(subjects);
router.use(events);
router.use(bugs);
router.use(students);
router.use(user);
router.use(evaluative_activity);

module.exports = router;
