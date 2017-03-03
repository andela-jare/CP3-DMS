/**
 * @class ErrorStatus
 */
class ErrorStatus {
  /**
   * queryFail(400)
   * @param {Object} res - response object
   * @param {Number} code - status code
   * @param {Object} error - sequelize error object
   * @return {Object} res - response object
   */
  static queryFail(res, code, error) {
    return res.status(code).send({
      message: error.errors[0].message
    });
  }
}

export default ErrorStatus;
