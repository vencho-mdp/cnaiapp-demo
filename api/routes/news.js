const express = require('express')
const {
  get_news,
  add_news,
  delete_news,
  update_news
} = require('../controllers/news')
const auth = require('../middlewares/auth')
const multer = require('../middlewares/multer')
const router = express.Router()

router.post('/news', [multer.single('image')], add_news)
router.get('/news', get_news)
router.put('/news', [multer.single('image')], update_news)
router.delete('/news', delete_news)

module.exports = router
