/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  const users = await knex("user")
    .select(
      "user.id",
      "first_name",
      "last_name",
      knex.raw('"group".name AS group_name')
    )
    .join("user_group", "user.id", "user_group.user_id")
    .join("group", "user_group.group_id", "group.id");

  const randomPreceptors = (max = 5) => {
    return users
      .filter((user) => user.group_name === "preceptor")
      .sort(() => Math.random() - 0.5)
      .slice(0, max);
  };
  const randomStudents = (max = 5) => {
    return users
      .filter((user) => user.group_name === "student")
      .sort(() => Math.random() - 0.5)
      .slice(0, max);
  };

  // fake records
  const records = [...new Array(5)]
    .map(() => ({
      added_by: randomPreceptors()[0].id,
      student_id: randomStudents()[0].id,
      date: new Date(),
      is_justified: null,
      reason_of_deletion: "Error al pasar el listado",
      shift: "Turno",
      reported_by: randomPreceptors()[1].id,
    }))
    .concat([
      {
        added_by: randomPreceptors()[2].id,
        student_id: randomStudents()[1].id,
        date: new Date(),
        is_justified: "Paro de Transporte",
        reason_of_deletion: "Llegó tarde",
        shift: "Contraturno",
      },
    ]);

  return knex("student_absence").then(function () {
    return knex("student_absence").insert(records);
  });
};
