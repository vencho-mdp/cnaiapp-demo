/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("grades", (table) => {
    table
      .uuid("evaluative_activity_id")
      .references("id")
      .inTable("evaluative_activity")
      .onDelete("CASCADE");
    // special types
    // 'Nota trayectoria', 'Nota final'
    table.text("special_type");
    table.boolean("is_second_quarter");
    table
      .uuid("student_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");
    table.text("grade").notNullable();
    table.text("comment").defaultTo(null);
    table
      .uuid("teacher_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");
    table.primary([
      "evaluative_activity_id",
      "student_id",
      "teacher_id",
      "special_type",
      "is_second_quarter",
    ]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("grades");
};
