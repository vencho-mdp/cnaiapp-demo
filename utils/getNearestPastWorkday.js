export default () => {
  // if current date is a weekday return the date
  // otherwise return nearest friday that's in the past
  const date = new Date();
  const day = date.getDay();
  if (day !== 0 && day !== 6) {
    return date;
  }

  const nearestPastFriday = new Date(
    date.getTime() -
      // if day = 0 => 2
      24 * 60 * 60 * 1000 * (day === 0 ? 2 : day === 6 ? 1 : 0)
  );
  return nearestPastFriday;
};
