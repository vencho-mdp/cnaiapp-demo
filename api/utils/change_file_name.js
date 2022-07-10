const path = require('path')
const { promises } = require('fs')

module.exports = async (original_name, new_name) => {
  const name = `${new_name}${path.extname(original_name)}`
  await promises.rename(
    path.join(__dirname, '..', 'images', original_name),
    path.join(__dirname, '..', 'images', name)
  )
  return { msg: 'Success', name }
}
