const jwt = require('jsonwebtoken')
const do_arrays_intersect = require('../utils/intersection_of_arrays')

module.exports = (
  { headers: { authorization } },
  res,
  next,
  groups_that_have_access = ['preceptor', 'management_team']
) => {
  try {
    const token = authorization?.split?.(' ')[1]
    // Get data from token
    const { groups } = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    if (do_arrays_intersect(groups, groups_that_have_access)) { next() } else { res.status(401).json({ error: 'Unauthorized' }) }
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
