const jwt = require("jsonwebtoken");
const {
  get_students,
  add_students_that_were_absent,
  get_absent_students,
  get_suspicious_cases,
  get_late_students,
  get_student_absence_dates,
  add_checked_classes,
  get_checked_classes,
  get_student_grades,
} = require("../services/students");

class students_controller {
  async get_students(req, res) {
    try {
      const user_id = jwt.verify(
        req.headers.authorization.split(" ")[1],
        process.env.ACCESS_TOKEN_SECRET
      ).id;
      const students = await get_students(
        JSON.parse(req.query.classes_ids),
        user_id,
        req.query.include_students_from_subjects
      );

      res.status(201).json(students);
    } catch (error) {
      console.error(error);
      return res.status(500).send({
        error,
      });
    }
  }

  async add_students_that_were_absent({ headers, body }, res) {
    const user_token = headers.authorization.split(" ")[1];
    const user_id = jwt.verify(user_token, process.env.ACCESS_TOKEN_SECRET).id;
    try {
      const students = await add_students_that_were_absent(
        body.list,
        body.date,
        user_id
      );
      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async get_absent_students(req, res) {
    try {
      const user_id = jwt.verify(
        req.headers.authorization.split(" ")[1],
        process.env.ACCESS_TOKEN_SECRET
      ).id;
      const students = await get_absent_students(
        req.query.date,
        JSON.parse(req.query.classes_ids),
        user_id
      );
      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async get_student_absence_dates(req, res) {
    try {
      const dates = await get_student_absence_dates(
        req.query.student_id,
        req.query.class_id,
        req.query.since_date
      );
      res.status(200).json(dates);
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async get_suspicious_cases(req, res) {
    try {
      const students = await get_suspicious_cases();
      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async get_late_students(req, res) {
    try {
      const { date, classes_ids } = req.query;
      const students = await get_late_students(date, JSON.parse(classes_ids));
      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async add_checked_classes(req, res) {
    try {
      const { date, classes_ids } = req.body;
      const students = await add_checked_classes(classes_ids, date);
      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async get_checked_classes(req, res) {
    try {
      const { date } = req.query;
      const students = await get_checked_classes(date);
      res.status(200).json(students);
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }

  async get_student_grades(req, res) {
    try {
      const { student_id } = req.params;
      const grades = await get_student_grades(student_id);
      res.status(200).json(grades);
    } catch (error) {
      console.error(error);
      return res.status(error.status).send({
        error,
      });
    }
  }
}

module.exports = new students_controller();
