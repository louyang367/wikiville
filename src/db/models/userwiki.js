'use strict';
module.exports = (sequelize, DataTypes) => {
  var UserWiki = sequelize.define('UserWiki', {
    wikiId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'Wiki',
        key: 'id'
      },
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: 'User',
        key: 'id'
      },
      allowNull: false
    }
  }, {});

  UserWiki.associate = function(models) {
    // associations can be defined here
  };
  return UserWiki;
};