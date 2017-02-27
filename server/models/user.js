import bcrypt from 'bcrypt';

export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    username: {
      type: DataTypes.STRING,
      unique: {
        msg: 'Sorry, username already exists.'
      },
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [3, 20],
          msg: 'Sorry, username must be between 3 to 20 characters.'
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [2, 20],
          msg: 'Sorry, first name must be between 2 to 20 characters.'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: {
          args: [2, 20],
          msg: 'Sorry, last name must be between 2 to 20 characters.'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      unique: {
        msg: 'Sorry, email already exists.'
      },
      allowNull: false,
      validate: {
        isEmail: {
          msg: 'Invalid email'
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        isMin(value) {
          if (parseInt(value.length, 10) < 6) {
            throw new Error('Password must be at least 6 characters.');
          }
        },
        // is: {
        //   args: /^[a-z0-9-@$!%*#?&._]+$/i,
        //   msg: 'Password can only contain alphanumeric and special characters'
        // }
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
