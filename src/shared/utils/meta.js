module.exports = function parseDataWithMeta(data, page, limit, total) {
  this.page = page;
  this.limit = limit;
  this.total = total;
  this.data = data;

  return {
    meta: {
      page: Number(this.page),
      count: this.data?.length ?? 0,
      limit: Number(this.limit),
      total: Number(this.total),
    },
    data: this.data,
  };
};
