function replaceNbsps (str) {
  const re = new RegExp(String.fromCharCode(160), 'g')
  return str.replace(re, ' ')
}

export default replaceNbsps
