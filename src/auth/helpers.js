const bcrypt = require("bcryptjs");

module.exports = {

  ensureAuthenticated(req, res, next) {
    //When Passport successfully authenticates a user, it places the user in req.user
    if (!req.user){ 
      req.flash("notice", "You must be logged in to do that.")
      return res.redirect("/users/login");
    } else {
      next();
    }
  },

  comparePassword(userPassword, databasePassword) {
    return bcrypt.compareSync(userPassword, databasePassword);
  }
}
