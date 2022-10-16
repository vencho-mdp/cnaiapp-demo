const {
  addEvaluativeActivity,
  getEvaluativeActivities,
  updateGrades,
  updateEvaluativeActivity,
} = require("../dao/evaluative_activity.js");

class evaluative_activity_service {
  async addEvaluativeActivity(u_id) {
    try {
      return await addEvaluativeActivity(u_id);
    } catch (error) {
      console.log(error);
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Internal server error.",
      };
    }
  }
  async getEvaluativeActivities(u_id) {
    try {
      return await getEvaluativeActivities(u_id);
    } catch (error) {
      console.log(error);
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Internal server error.",
      };
    }
  }

  async updateEvaluativeActivity(evaluative_activity) {
    try {
      return await updateEvaluativeActivity(evaluative_activity);
    } catch (error) {
      console.log(error);
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Internal server error.",
      };
    }
  }

  async updateGrades(grades) {
    try {
      return await updateGrades(grades);
    } catch (error) {
      console.log(error);
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Internal server error.",
      };
    }
  }
}

module.exports = new evaluative_activity_service();
