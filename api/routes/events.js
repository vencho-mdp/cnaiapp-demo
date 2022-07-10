const express = require('express')
const auth = require('../middlewares/auth')
const multer = require('../middlewares/multer')

const {
  get_events,
  add_event,
  update_event,
  delete_event
} = require('../controllers/events')

const router = express.Router()

router.get('/events', get_events)
router.post('/events', multer.single('image'), add_event)
router.put('/events', multer.single('image'), update_event)
router.delete('/events', delete_event)

module.exports = router
