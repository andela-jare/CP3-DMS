// Document helper methods

const DocumentHelper = {

  documentAccess(document, req) {
    if (document.access === 'public' ||
      document.ownerId === req.decoded.userId
      || req.decoded.roleId === 1) {
      return true;
    }
  },

  isOwner(document, req) {
    if (document.ownerId === req.decoded.userId) {
      return true;
    }
  },

  isRoleAccess(document, req) {
    return (document.access === 'role'
    && req.decoded.roleId === document.User.roleId);
  }
};

export default DocumentHelper;
