/**
 * @class Paginate
 */
class Paginate {
  /**
   * queryFail(400)
   * @param {Object} res - response object
   * @param {Number} code - status code
   * @param {Object} error - sequelize error object
   * @return {Object} res - response object
   */
  static paginator(req, entity) {
    let totalPages = 1;
    if (req.query.limit < entity.count) {
      totalPages = Math.ceil(entity.count / req.query.limit);
    }
    const currentPage = Math.floor(req.query.offset / req.query.limit) + 1;
    return {
      totalPages,
      currentPage
    };
  }
}

export default Paginate;
