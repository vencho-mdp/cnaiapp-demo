const {
  add_bug
} = require('../services/bugs')

class Bugs_controller {
  async add_bug (req, res) {
    try {
      await add_bug(req.body)
      res.status(201).json({ message: 'Created successfully' })
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }
}

module.exports = new Bugs_controller()
