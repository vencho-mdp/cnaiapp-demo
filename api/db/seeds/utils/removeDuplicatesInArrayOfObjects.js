module.exports = (arr) => {
  const result = []
  const obj = {}
  for (let i = 0; i < arr.length; i++) {
    const str = JSON.stringify(arr[i])
    if (!obj[str]) {
      obj[str] = true
      result.push(arr[i])
    }
  }
  return result
}
