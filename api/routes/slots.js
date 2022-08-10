const express = require('express')
const auth = require('../middlewares/auth')
const { get_slots, update_slots } = require('../controllers/slots')

const router = express.Router()

router.get('/slots', get_slots)
router.put('/slots', auth, update_slots)

module.exports = router
