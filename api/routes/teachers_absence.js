const express = require("express");
const auth = require("../middlewares/auth");

const {
  get_all_absent_teachers,
  add_absent_teacher,
  update_absent_teacher,
  delete_absent_teacher,
} = require("../controllers/teachers_absence");

const router = express.Router();

router.get("/absent-teachers", get_all_absent_teachers);
router.post("/absent-teachers", auth, add_absent_teacher);
router.put("/absent-teachers", auth, update_absent_teacher);
router.delete("/absent-teachers", auth, delete_absent_teacher);

module.exports = router;
