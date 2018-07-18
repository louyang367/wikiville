'use strict';
const faker = require("faker");
const User = require("../models").User;

let users = [];

for (let i = 1; i <= 5; i++) {
  users.push({
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: '$2a$10$qwxFgPyKla9bAvocGmMkpOBRDHXw2qXMJ/cDvqIQtouJ4fc8/rKF.', //1213456
    role: User.STANDARD,
    createdAt: new Date(),
    updatedAt: new Date()
  });
}


module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Users", users, {});
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", null, {});
  }
};
