module.exports = function commaStringToList(str) {
  if (str === null || str === undefined) {
    return null;
  }
  const rawList = String(str).split(",");
  const trimmedList = rawList.map((item) => item.trim());
  const filteredList = trimmedList.filter((item) => item.length > 0);

  return filteredList.length === 0 ? null : filteredList;
};
