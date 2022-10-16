/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("evaluative_activity_classes", (table) => {
    table
      .uuid("evaluative_activity_id")
      .notNullable()
      .references("id")
      .inTable("evaluative_activity")
      .onDelete("CASCADE");
    table
      .uuid("class_id")
      .notNullable()
      .references("id")
      .inTable("class")
      .onDelete("CASCADE");

    table.primary(["evaluative_activity_id", "class_id"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("evaluative_activity_classes");
};
