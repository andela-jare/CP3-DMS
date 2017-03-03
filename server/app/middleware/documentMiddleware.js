import db from '../../models';
import helper from './helper';

/**
 * class AuthStatus to autheticate users
*/
class DocumentAccess {
  /**
   * Method to authenticate a user before proceeding
   * to protected document routes
   * @param {Object} req - The request Object
   * @param {Object} res - The response Object
   * @param {Function} next - Function call to move to the next middleware
   * or endpoint controller
   * @return {void} - Returns void
   */
  static documentWriteAccess(req, res, next) {
    db.Document.findById(req.params.id)
      .then((document) => {
        if (!document) {
          return res.status(404)
            .send({ message: 'Document Not found.' });
        }

        if (req.decoded.userId !== document.ownerId
        && req.decoded.roleId !== 1) {
          return res.status(403)
            .send({
              message: 'You are restricted from performing this action.'
            });
        }
        req.document = document;
        next();
      });
  }

  /**
   * Method to authenticate a user before proceeding
   * to protected document routes
   * @param {Object} req - The request Object
   * @param {Object} res - The response Object
   * @param {Function} next - Function call to move to the next middleware
   * or endpoint controller
   * @return {void} - Returns void
   */
  static search(req, res, next) {
    const search = req.query.search.trim();
    req.queryBuilder = {
      where: {
        $and: [{
          $or: {
            title: {
              $ilike: `%${search}%`
            },
            content: {
              $ilike: `%${search}%`
            }
          }
        }, {
          $or: {
            ownerId: req.decoded.userId,
            access: 'public'
          }
        }
        ]
      }
    };

    if (helper.isAdmin(req.decoded.roleId)) {
      req.queryBuilder = { where: {
        $or: {
          title: {
            $ilike: `%${search}%`
          },
          content: {
            $ilike: `%${search}%`
          }
        }
      } };
    }

    req.queryBuilder.order = '"createdAt" DESC';
    next();
  }
}

export default DocumentAccess;
