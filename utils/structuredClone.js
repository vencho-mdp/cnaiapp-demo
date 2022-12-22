export const structuredClone =
  typeof structuredClone === "function"
    ? structuredClone
    : (obj) => JSON.parse(JSON.stringify(obj));
