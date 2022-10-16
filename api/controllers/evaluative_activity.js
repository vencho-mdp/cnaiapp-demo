const jwt = require("jsonwebtoken");
const {
  addEvaluativeActivity,
  getEvaluativeActivities,
  updateGrades,
  updateEvaluativeActivity,
} = require("../services/evaluative_activity");

class evaluative_activities_controller {
  async getEvaluativeActivities(req, res) {
    try {
      const user_id = jwt.verify(
        req.headers.authorization.split(" ")[1],
        process.env.ACCESS_TOKEN_SECRET
      ).id;
      const evaluative_activities = await getEvaluativeActivities(user_id);
      res.status(200).json(evaluative_activities);
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }
  async addEvaluativeActivity(req, res) {
    try {
      await addEvaluativeActivity(req.body);
      res.status(201).json({
        code: "CREATED",
      });
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async updateEvaluativeActivity(req, res) {
    try {
      await updateEvaluativeActivity(req.body);
      res.status(200).json({
        code: "UPDATED",
      });
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async updateGrades(req, res) {
    try {
      await updateGrades(req.body.grades);
      res.status(200).json({
        code: "UPDATED",
      });
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }
}

module.exports = new evaluative_activities_controller();
