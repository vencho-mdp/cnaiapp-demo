/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.up = function (knex) {
  return knex.schema.createTable('student_absence', (table) => {
    table.uuid('added_by').references('id').inTable('user').notNullable()
    table
      .uuid('student_id')
      .notNullable()
      .references('id')
      .inTable('user')
      .onDelete('CASCADE')
    table.timestamp('date').notNullable()
    // null -> is not justified
    // string -> is justified and that string is its reason
    table.string('is_justified')
    table.string('reason_of_deletion').defaultTo(null)
    table.string('shift').notNullable()
    table.uuid('reported_by').references('id').inTable('user').defaultTo(null)
    table.primary(['student_id', 'date', 'shift'])
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('student_absence')
}
