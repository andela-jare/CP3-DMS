// User helper methods

const UserHelper = {
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

  viewFields(data) {
    const allowedFields = [
      'id',
      'username',
      'firstName',
      'lastName',
      'email',
      'roleId'
    ];
    const result = {};

    Object.keys(data.dataValues).forEach((field) => {
      if (allowedFields.includes(field)) {
        result[field] = data.dataValues[field];
      }
    });

    return result;
  },

  userOrAdmin(req) {
    if (Number(req.params.id) !== req.decoded.userId
    && req.decoded.roleId !== 1) {
      return true;
    }
  },

  isAdmin(roleId) {
    if (roleId === 1) {
      return true;
    }
  },

  norUserAdmin(req) {
    if (req.decoded.userId !== Number(req.params.id)
    || req.decoded.roleId === 1) {
      return true;
    }
  }
};

export default UserHelper;
