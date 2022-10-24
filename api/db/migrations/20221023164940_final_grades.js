/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("final_grades", (table) => {
    // types
    // 'Nota trayectoria', 'Nota final', 'Diciembre', 'Marzo', 'Julio'
    table.text("type");
    table.boolean("is_second_quarter");
    table
      .uuid("student_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");
    table.text("grade").notNullable();
    table
      .uuid("teacher_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("SET NULL");
    table
      .uuid("subject_id")
      .notNullable()
      .references("id")
      .inTable("subject")
      .onDelete("SET NULL");

    table.primary(["type", "is_second_quarter", "student_id", "subject_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("final_grades");
};
