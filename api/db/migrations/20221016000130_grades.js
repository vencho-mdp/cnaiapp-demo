/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("grades", (table) => {
    table
      .uuid("evaluative_activity_id")
      .notNullable()
      .references("id")
      .inTable("evaluative_activity")
      .onDelete("CASCADE");
    table
      .uuid("student_id")
      .notNullable()
      .references("id")
      .inTable("user")
      .onDelete("CASCADE");
    table.text("grade").notNullable();
    table.text("comment").defaultTo(null);
    table.primary(["evaluative_activity_id", "student_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("grades");
};
