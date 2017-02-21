import bcrypt from 'bcrypt';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    roleId: {
      type: DataTypes.INTEGER,
      defaultValue: 2,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
  }, {
    classMethods: {
      associate(models) {
        // associations can be defined here
        User.belongsTo(models.Role, {
          onDelete: 'CASCADE',
          foreignKey: 'roleId'
        });
        User.hasMany(models.Document, {
          foreignKey: 'ownerId',
          onDelete: 'CASCADE'
        });
      }
    },
    instanceMethods: {
      /**
       * Hash user's password
       * @method
       * @returns {void} no return
      */
      hashPassword() {
        this.password = bcrypt.hashSync(this.password, bcrypt.genSaltSync(8));
      }
    },
    hooks: {
      beforeCreate(user) {
        user.hashPassword();
      },
      beforeUpdate(user) {
        user.hashPassword();
      }
    }
  });
  return User;
};
