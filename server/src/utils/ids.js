export const toId = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value._id) return value._id.toString();
    if (value.id) return String(value.id);
  }
  if (typeof value.toString === "function") {
    const asString = value.toString();
    if (asString && asString !== "[object Object]") return asString;
  }
  return null;
};

export const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
