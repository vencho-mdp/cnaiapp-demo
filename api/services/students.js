const {
  get_students,
  add_students_that_were_absent,
  get_absent_students,
  get_suspicious_cases,
} = require("../dao/students");

class students_service {
  async get_students(classes_ids, u_id) {
    try {
      return await get_students(classes_ids, u_id);
    } catch (error) {
      console.log(error);
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Internal server error.",
      };
    }
  }

  async add_students_that_were_absent(list, date, user_id) {
    try {
      return await add_students_that_were_absent(list, date, user_id);
    } catch (error) {
      console.log(error);
      throw {
        status: 400,
        code: "BAD_REQUEST",
        msg: "You don't have enough permissions to perform this action.",
      };
    }
  }

  async get_absent_students(date, classes_ids) {
    try {
      return await get_absent_students(date, classes_ids);
    } catch (error) {
      console.log(error);
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Internal server error.",
      };
    }
  }

  async get_suspicious_cases() {
    try {
      return await get_suspicious_cases();
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

module.exports = new students_service();
