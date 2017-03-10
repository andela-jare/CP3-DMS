/**
 * @class Paginate
 */
class Paginate {
  /**
   * paginator helps with paginating an array of result.
   * @param {Object} req - request object
   * @param {Object} entity - result from a model
   * @return{void|Object} - returns object.
   */
  static paginator(req, entity) {
    let totalPages = 1;
    if (req.query.limit < entity.count) {
      totalPages = Math.ceil(entity.count / req.query.limit);
    }
    const currentPage = Math.floor(req.query.offset / req.query.limit) + 1;
    return {
      page: currentPage,
      pageSize: entity.rows.length,
      pageCount: totalPages
    };
  }
}

export default Paginate;
