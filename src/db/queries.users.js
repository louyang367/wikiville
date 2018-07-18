const User = require("./models").User;
const bcrypt = require("bcryptjs");

module.exports = {
  createUser(newUser, callback) {

    const salt = bcrypt.genSaltSync();
    const hashedPassword = bcrypt.hashSync(newUser.password, salt);

    return User.create({
      name: newUser.name,
      email: newUser.email,
      password: hashedPassword,
      role: User.STANDARD
    })
      .then((user) => {
        callback(null, user);
      })
      .catch((err) => {
        callback(err);
      })
  },

  updateUser(req, updatedUser, callback) {
    if (!req.user) {
      return callback("User not found");
    }

    return req.user.update(updatedUser, {
      fields: Object.keys(updatedUser)
    })
      .then((user) => {
        callback(null, user);
      })
      .catch((err) => {
        callback(err);
      });
  },

  getAllUsers(callback) {
    return User.all()
      .then((users) => {
        callback(null, users);
      })
      .catch((err) => {
        callback(err);
      })
  },

  getSharedWikis(user, callback){
    return user.getSharedWikis({include:[
      {model: User,
      as: "creator"}
    ]})
      .then((wikis) => {
        callback(null, wikis);
      })
      .catch((err) => {
        callback(err);
      });
  },

}
