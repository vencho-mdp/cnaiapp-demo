const express = require("express");
const {
  change_email,
  change_password,
  get_all_users,
} = require("../controllers/user");
const auth = require("../middlewares/auth");

const router = express.Router();

router.put("/user/email", change_email);
router.put("/user/password", change_password);
router.get(
  "/users",
  (req, res, next) => auth(req, res, next, ["management_team"]),
  get_all_users
);

module.exports = router;
