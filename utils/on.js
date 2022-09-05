export const on = (element, event, handler, opts) => {
  if (element && event && handler) {
    element.addEventListener(event, handler, opts);
  }
};
