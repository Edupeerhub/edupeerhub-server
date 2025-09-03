module.exports = function commaStringToList(str) {
  if (str === null || str === undefined) {
    return null;
  }
  const list = str?.split(",");
  return list.length === 1 && list[0].trim() === "" ? null : list;
};
