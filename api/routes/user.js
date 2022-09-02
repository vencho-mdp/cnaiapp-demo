const express = require("express");
const {
  change_email,
  change_password,
  get_all_users,
  delete_user,
  add_user,
  edit_user,
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
router.delete(
  "/users",
  (req, res, next) => auth(req, res, next, ["management_team"]),
  delete_user
);
router.post(
  "/users",
  (req, res, next) => auth(req, res, next, ["management_team"]),
  add_user
);
router.put(
  "/users",
  (req, res, next) => auth(req, res, next, ["management_team"]),
  edit_user
);

module.exports = router;
