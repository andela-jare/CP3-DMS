/**
 * @class Response
 */
class Response {
  /**
   * Method for returning 404 errors
   * @param {Object} res - response object
   * @param {String} message - message to return back to user
   * @return {Object} res - response object
   */
  static notFound(res, message) {
    return res.status(404)
      .send({
        message
      });
  }

  /**
   * Method for returning 404 errors
   * @param {Object} res - response object
   * @param {Number} code - status code
   * @param {String} error - error to return back to user
   * @return {Object} res - response object
   */
  static queryFail(res, code, error) {
    return res.status(code)
      .send({
        message: error.errors[0].message
      });
  }

  /**
   * Method for returning 404 errors
   * @param {Object} res - response object
   * @param {String} message - message to return back to user
   * @return {Object} res - response object
   */
  static restricted(res, message) {
    return res.status(403)
      .send({
        message
      });
  }
}

export default Response;
