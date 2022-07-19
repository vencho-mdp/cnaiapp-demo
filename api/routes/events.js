const express = require("express");
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer");

const {
  get_events,
  add_event,
  update_event,
  delete_event,
} = require("../controllers/events");

const router = express.Router();

router.get("/events", get_events);
router.post(
  "/events",
  [
    (req, res, next) =>
      auth(req, res, next, ["management_team", "community_manager"]),
    multer.single("image"),
  ],
  add_event
);
router.put(
  "/events",
  [
    (req, res, next) =>
      auth(req, res, next, ["management_team", "community_manager"]),
    multer.single("image"),
  ],
  update_event
);
router.delete(
  "/events",
  (req, res, next) =>
    auth(req, res, next, ["management_team", "community_manager"]),
  delete_event
);

module.exports = router;
