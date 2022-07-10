const {
  get_all_absent_teachers,
  add_absent_teacher,
  update_absent_teacher,
  delete_absent_teacher
} = require('../services/teachers_absence')

class Teachers_absence_controller {
  async get_all_absent_teachers (req, res) {
    try {
      const data = await get_all_absent_teachers()
      res.status(200).json(data)
    } catch (error) {
      return res.status(error.status).send({
        error
      })
    }
  }

  async add_absent_teacher (req, res) {
    try {
      await add_absent_teacher(req.body)
      res.status(201).json({ message: 'Created successfully' })
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }

  async update_absent_teacher (req, res) {
    try {
      await update_absent_teacher(req.body)
      res.status(204).json()
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }

  async delete_absent_teacher (req, res) {
    try {
      await delete_absent_teacher(req.body.id)
      res.status(201).json({ message: 'Teacher successfully deleted' })
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }
}

module.exports = new Teachers_absence_controller()
