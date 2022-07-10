const {
  get_all_teachers,
  get_teachers_class
} = require('../services/teachers')

class teachers_controller {
  async get_all_teachers (req, res) {
    try {
      const data = await get_all_teachers()
      res.status(200).json(data)
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }

  // teacher's class
  async get_teachers_class (req, res) {
    try {
      const { teacher_id } = req.params
      const data = await get_teachers_class(teacher_id)
      res.status(200).json(data)
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }
}

module.exports = new teachers_controller()
