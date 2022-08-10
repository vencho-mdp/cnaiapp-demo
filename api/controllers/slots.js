const { get_slots, update_slots } = require('../services/slots')

class slot_controller {
  async get_slots (req, res) {
    try {
      const slot = await get_slots(req.query.className, req.query.classesIds)
      res.status(201).json(slot)
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }

  async update_slots (req, res) {
    try {
      await update_slots(req.body)
      res.status(204).json()
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }
}

module.exports = new slot_controller()
