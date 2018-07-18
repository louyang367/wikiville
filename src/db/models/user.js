'use strict';
module.exports = (sequelize, DataTypes) => {
  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }, 
    role: {
      type: DataTypes.INTEGER,
      defaultValue: this.STANDARD
    }
  }, {});

  User.associate = function (models) {
    User.hasMany(models.Wiki, {
      foreignKey: "userId",
      as: "wikis"
    });

    User.belongsToMany(models.Wiki, {
      as: "sharedWikis", 
      through: "UserWiki",
      foreignKey: "userId",
      otherKey: "wikiId"
    });
  };

  User.STANDARD = 0;
  User.PREMIUM = 1;
  User.ADMIN = 2;
  
  User.prototype.isAdmin = function () {
    return this.role == User.ADMIN;
  };

  User.prototype.isPremium = function () {
    return this.role == User.PREMIUM;
  };

  User.prototype.isStandard = function () {
    return this.role == User.STANDARD
  };

  return User;
};