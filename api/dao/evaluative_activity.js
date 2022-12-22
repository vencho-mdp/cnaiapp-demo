const db = require("../db/db");

class evaluative_activity_DAO {
  async getEvaluativeActivities(user_id) {
    const evaluative_activities = await db("evaluative_activity")
      .select(
        "evaluative_activity.id",
        "title",
        "dates",
        "grade_type",
        "min_grade_to_pass",
        "type",
        db.raw(
          "json_agg(json_build_object('teacher_id', evaluative_activity_subjects_teachers.teacher_id, 'subject_id', subject_id)) AS teachers_subjects"
        ),
        db.raw("ARRAY_AGG(class_id) AS classes"),
        db.raw(
          "json_agg(json_build_object('student_id', student_id, 'grade', grades.grade)) AS grades"
        )
      )
      .leftJoin(
        "evaluative_activity_subjects_teachers",
        "evaluative_activity.id",
        "evaluative_activity_subjects_teachers.evaluative_activity_id"
      )
      .leftJoin(
        "evaluative_activity_classes",
        "evaluative_activity.id",
        "evaluative_activity_classes.evaluative_activity_id"
      )
      .leftJoin("grades", function () {
        this.on(
          "evaluative_activity.id",
          "=",
          "grades.evaluative_activity_id"
        ).andOn("grades.teacher_id", "=", db.raw("?", [user_id]));
      })
      .leftJoin("class", "evaluative_activity_classes.class_id", "class.id")
      .where("evaluative_activity_subjects_teachers.teacher_id", user_id)
      .groupBy("evaluative_activity.id")
      .orderBy("evaluative_activity.dates", "desc");

    return evaluative_activities;
  }

  async addEvaluativeActivity(evaluative_activity) {
    const {
      dates,
      title,
      grade_type,
      min_grade_to_pass,
      classes,
      type_of_eval: type,
      subjects_and_teachers_involved,
    } = evaluative_activity;
    await db.transaction(async (trx) => {
      const [{ id }] = await trx("evaluative_activity")
        .insert({
          dates: dates.map((el) => new Date(el).toISOString()),
          title,
          grade_type,
          min_grade_to_pass,
          type,
        })
        .returning("id");
      await trx("evaluative_activity_subjects_teachers").insert(
        subjects_and_teachers_involved.map((subject_and_teacher) => {
          return {
            evaluative_activity_id: id,
            subject_id: subject_and_teacher.subject_id,
            teacher_id: subject_and_teacher.teacher_id,
          };
        })
      );
      await trx("evaluative_activity_classes").insert(
        classes.map((class_id) => ({
          evaluative_activity_id: id,
          class_id,
        }))
      );
    });
  }

  async updateEvaluativeActivity(evaluative_activity) {
    const {
      id,
      dates,
      title,
      grade_type,
      min_grade_to_pass,
      classes,
      type_of_eval: type,
      subjects_and_teachers_involved,
    } = evaluative_activity;
    await db.transaction(async (trx) => {
      await trx("evaluative_activity")
        .where("id", id)
        .update({
          dates: dates.map((el) => new Date(el).toISOString()),
          title,
          grade_type,
          type,
          min_grade_to_pass,
        });
      await trx("evaluative_activity_subjects_teachers")
        .where("evaluative_activity_id", id)
        .del();
      await trx("evaluative_activity_subjects_teachers").insert(
        subjects_and_teachers_involved.map((subject_and_teacher) => {
          return {
            evaluative_activity_id: id,
            subject_id: subject_and_teacher.subject_id,
            teacher_id: subject_and_teacher.teacher_id,
          };
        })
      );
      if (classes) {
        await trx("evaluative_activity_classes")
          .where("evaluative_activity_id", id)
          .del();
        await trx("evaluative_activity_classes").insert(
          classes.map((class_id) => ({
            evaluative_activity_id: id,
            class_id,
          }))
        );
      }
    });
  }

  async updateGrades(grades) {
    return await db("grades")
      .insert(grades)
      .onConflict(["student_id", "evaluative_activity_id", "teacher_id"])
      .merge(["grade"]);
  }
}

module.exports = new evaluative_activity_DAO();
