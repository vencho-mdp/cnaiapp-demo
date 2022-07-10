exports.seed = function (knex) {
  return knex('group')
    .del()
    .then(function () {
      return knex('group').insert([{ name: 'teacher' }, { name: 'preceptor' }, { name: 'student' }, { name: 'management_team' }, { name: 'community_manager' }])
    })
}
