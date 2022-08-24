const {
  change_email,
  change_password,
  get_all_users,
  delete_user,
} = require("../services/user");

class User_controller {
  async change_email(req, res) {
    try {
      await change_email(req.body);
      res.status(200).json({ message: "Changed successfully" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  async change_password(req, res) {
    try {
      await change_password(req.body);
      res.status(200).json({ message: "Changed successfully" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  async get_all_users(req, res) {
    try {
      const users = await get_all_users();
      res.status(200).json(users);
    } catch (error) {
      return res.status(500).send(error);
    }
  }

  async delete_user(req, res) {
    try {
      await delete_user(req.body.user_id);
      res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      return res.status(500).send(error);
    }
  }
}

module.exports = new User_controller();
