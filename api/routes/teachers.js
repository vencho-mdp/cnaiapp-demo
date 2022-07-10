const express = require('express')
const {
  get_all_teachers,
  get_teachers_class
} = require('../controllers/teachers')

const router = express.Router()

router.get('/teachers', get_all_teachers)
router.get('/teachers/:teacher_id', get_teachers_class)

module.exports = router
