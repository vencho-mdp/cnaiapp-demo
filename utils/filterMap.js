/**
 * Filter and Map an Array in a single loop
 * @param {array} arr The list to process
 * @param {function} filterFn The filtering logic
 * @param {function} mapFn The transforming logic
 */
const isFn = f => typeof f === 'function'
export default (arr, filterFn = null, mapFn = null) => {
  return arr.reduce((acc, item, i) => {
    if (isFn(filterFn) && filterFn(item, i) === false) { return acc }
    const newItem = isFn(mapFn) ? mapFn(item, i) : item
    return [...acc, newItem]
  }, [])
}
