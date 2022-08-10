/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const preceptors = require('./preceptors.json')
exports.seed = async function (knex) {
  const users = await knex('user')
    .select(
      'user.id',
      'first_name',
      'last_name',
      knex.raw('"group".name AS group_name')
    )
    .join('user_group', 'user.id', 'user_group.user_id')
    .join('group', 'user_group.group_id', 'group.id')

  const classes_available = await knex('class').select(
    'id',
    knex.raw("CONCAT(grade, ' ', grade_number) AS class_name")
  )
  const records = users
    .filter(user => user.group_name === 'preceptor')
    .flatMap(user =>
      preceptors
        .find(
          el =>
            el.first_name === user.first_name && el.last_name === user.last_name
        )
        .classes.map(preceptor_class => ({
          user_id: user.id,
          class_id: classes_available.find(
            el => el.class_name === preceptor_class
          ).id
        }))
    )
  // user_class is being reset in
  // 03_users.js
  return knex('user_class').then(function () {
    return knex('user_class').insert(records)
  })
}
