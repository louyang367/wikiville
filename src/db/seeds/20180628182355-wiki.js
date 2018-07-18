'use strict';
const faker = require("faker");
const User = require("../models").User;

  module.exports = {
    up: async function (queryInterface, Sequelize) {
      let wikis = [];
      let users = await User.all().catch((err) => { console.log(err); });

      for (let i = 1; i <= 20; i++) {
        let index = Math.floor( Math.random() * users.length );
        let uid = users[index].id;

        wikis.push({
          title: faker.hacker.noun(),
          body: faker.hacker.phrase(),
          userId: uid,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
  
      return queryInterface.bulkInsert("Wikis", wikis, {});
    },
  
    down: async function (queryInterface, Sequelize) {
      return queryInterface.bulkDelete("Wikis", null, {});
    }
  };
  
