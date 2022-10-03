const {
  get_events,
  add_event,
  update_event,
  delete_event,
} = require("../services/events");

class Teachers_absence_controller {
  async get_events(req, res) {
    try {
      const data = await get_events(process.env.BASE_URL, req.query.show_past);
      res.status(200).json(data);
    } catch (error) {
      return res.status(error.status).send({
        error,
      });
    }
  }

  async add_event(req, res) {
    try {
      await add_event(req.body, req.file);
      res.status(201).json({ message: "Created successfully" });
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async update_event(req, res) {
    try {
      await update_event(req.body, req.file);
      res.status(204).json();
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async delete_event(req, res) {
    try {
      await delete_event(req.body.id);
      res.status(201).json({ message: "Teacher successfully deleted" });
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }
}

module.exports = new Teachers_absence_controller();
