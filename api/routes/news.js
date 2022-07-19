const express = require("express");
const {
  get_news,
  add_news,
  delete_news,
  update_news,
} = require("../controllers/news");
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer");
const router = express.Router();

router.get("/news", get_news);
router.post(
  "/news",
  [
    (req, res, next) =>
      auth(req, res, next, ["management_team", "community_manager"]),
    multer.single("image"),
  ],
  add_news
);
router.put(
  "/news",
  [
    (req, res, next) =>
      auth(req, res, next, ["management_team", "community_manager"]),
    multer.single("image"),
  ],
  update_news
);
router.delete(
  "/news",
  (req, res, next) =>
    auth(req, res, next, ["management_team", "community_manager"]),
  delete_news
);

module.exports = router;
