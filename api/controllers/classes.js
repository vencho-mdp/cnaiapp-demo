const jwt = require("jsonwebtoken");
const classes_service = require("../services/classes");

class class_controller {
  async get_classes(req, res) {
    try {
      // second condition in case user wants to get classes slots
      // but also uses panel (is logged in)
      if (
        req.headers.authorization?.split?.(" ")[1] &&
        !JSON.parse(req.query?.get_all || "false")
      ) {
        const { id } = jwt.verify(
          req.headers.authorization.split(" ")[1],
          process.env.ACCESS_TOKEN_SECRET
        );
        const classes = await classes_service.get_classes(id);
        res.status(201).json(classes);
        return;
      }
      const classes = await classes_service.get_classes();
      res.status(201).json(classes);
    } catch (error) {
      return res.status(401).send({
        error,
      });
    }
  }
}

module.exports = new class_controller();
