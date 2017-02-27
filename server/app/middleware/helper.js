/**
  * Method to verify that user is an Admin
  * to access Admin endpoints
  * @param{Number} query - Query type either limit or offset
  * @param{Number} min - A minimum number to check agsint
  * @return{Boolean} - returns true or false.
  */
export default {
  limitOffsetHelper(query, min) {
    if (query < min || query > 10) {
      return false;
    }
    return true;
  },
  usersFields(fields) {
    const userUpdateFields = [
      'username',
      'firstName',
      'lastName',
      'email',
      'password'
    ];
    const query = {};
    Object.keys(fields).forEach((prop) => {
      if (userUpdateFields.includes(prop)) {
        query[prop] = fields[prop];
      }
    });
    return query;
  },
  findUsersAttributes() {
    return [
      'id',
      'username',
      'firstName',
      'lastName',
      'email',
      'roleId',
      'createdAt',
      'updatedAt'
    ];
  },
  userOrAdmin(param1, req) {
    if (Number(param1) !== req.decoded.userId
    && req.decoded.roleId !== 1) {
      return true;
    }
  },
  isAdmin(roleId) {
    if (roleId === 1) {
      return true;
    }
  },
  documentAccess(document, req) {
    if (document.access === 'public' ||
      document.ownerId === req.decoded.userId
      || req.decoded.roleId === 1) {
      return true;
    }
  },
  limitOffsetMessage(name) {
    return `Enter a valid number for ${name} within the range 1 - 10.`;
  },
  norUserAdmin(req) {
    if (req.decoded.userId !== Number(req.params.id)
    || req.decoded.roleId === 1) {
      return true;
    }
  },
  isOwner(document, req) {
    if (document.ownerId === req.decoded.userId) {
      return true;
    }
  }
};
