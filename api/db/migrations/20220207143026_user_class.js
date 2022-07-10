exports.up = function (knex) {
  return knex.schema.createTable('user_class', (table) => {
    table.primary(['user_id', 'class_id'])

    table
      .uuid('user_id')
      .references('id')
      .inTable('user')
      .notNullable()
      .onDelete('CASCADE')

    table
      .uuid('class_id')
      .references('id')
      .inTable('class')
      .notNullable()
      .onDelete('CASCADE')
  })
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('user_class')
}
