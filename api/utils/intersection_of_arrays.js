module.exports = (array1, array2) => {
  return array1.some(element => array2.includes(element))
}
