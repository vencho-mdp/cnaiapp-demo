exports.seed = function (knex) {
  const grades = [
    '1ro',
    '2do',
    '3ro',
    '4to',
    '5to',
    '6to'
  ]
  const grade_numbers = [
    '1ra',
    '2da',
    '3ra',
    '4ta'
  ]
  // classes are a combination where each grade has the for grade numbers
  let classes = grades.flatMap(grade => grade_numbers.map(grade_number => ({ grade, grade_number })))
  // handle exceptional case
  classes = [...classes, { grade: '1ro', grade_number: '5ta' }]
  return knex('class')
    .del()
    .then(function () {
      return knex('class').insert(classes)
    })
}
