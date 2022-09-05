export const off = (element, event, handler, opts) => {
  if (element && event) {
    element.removeEventListener(event, handler, opts);
  }
};
