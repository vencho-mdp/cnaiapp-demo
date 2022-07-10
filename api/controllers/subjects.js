const { get_subjects } = require('../services/subjects')

class subject_controller {
  async get_subjects (req, res) {
    try {
      const subjects = await get_subjects()
      res.status(201).json(subjects)
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }
}

module.exports = new subject_controller()
