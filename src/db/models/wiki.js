'use strict';
module.exports = (sequelize, DataTypes) => {
  var Wiki = sequelize.define('Wiki', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.STRING
    },
    private: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    }

  }, {});

  Wiki.associate = function(models) {
    Wiki.belongsTo(models.User, {
      foreignKey: "userId",
      as: "creator",
      onDelete: "CASCADE"
    });

    Wiki.belongsToMany(models.User, {
      as: "collaborators", 
      through: "UserWiki",
      foreignKey: "wikiId",
      otherKey: "userId"
    });
  };

  return Wiki;
};