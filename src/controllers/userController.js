const userQueries = require("../db/queries.users.js");
const wikiQueries = require("../db/queries.wikis.js");
const passport = require("passport");
const User = require("../db/models").User;
const Wiki = require("../db/models").Wiki;
const sgMail = require('@sendgrid/mail');
var stripe = require("stripe")("sk_test_T6XCxAzM3l0k8syNHsMEr9nJ");

module.exports = {
  signup(req, res, next) {
    res.render("users/signup");
  },

  create(req, res, next) {
    let newUser = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirmation: req.body.passwordConfirmation
    };
    userQueries.createUser(newUser, (err, user) => {
      if (err) {
        console.log(err);
        req.flash("error", [{ param: err.errors[0].type, msg: err.errors[0].message }]);
        res.redirect(req.headers.referer);
      } else {

        passport.authenticate("local")(req, res, () => {
          req.flash("notice", "You're successfully logged in!");

          //sendgrid
          sgMail.setApiKey(process.env.SENDGRID_API_KEY);
          const msg = {
            to: newUser.email,
            from: 'louyang367@gmail.com',
            subject: 'Thank you for registering with Wikiville!',
            text: `Your user name is ${newUser.name}, email: ${newUser.email}`,
            html: '<a href="louyang367-wikiville.heroku.com">Visit us here</a>',
          };
          sgMail.send(msg).then(() => {
            console.log('email sent')
          })
            .catch(error => {

              //Log friendly error
              console.error(error.toString());
              //Extract error msg
              const { message, code, response } = error;
              //Extract response msg
              const { headers, body } = response;
              console.log(headers, body)
            });

          res.redirect("/");
        })
      }
    });
  },

  loginForm(req, res, next) {
    res.render("users/login");
  },

  login(req, res, next) {
    // passport.authenticate("local", { 
    //   failureRedirect: '/users/login', 
    //   failureFlash: true,
    //   successRedirect: '/',
    //   successFlash: "You've successfully signed in!"
    // });
    passport.authenticate('local', function (err, user, info) {
      if (err) { return next(err); }
      if (!user) {
        req.flash("notice", info.message);
        return res.redirect('/users/login');
      }
      req.logIn(user, function (err) {
        if (err) { return next(err); }
        req.flash("notice", "You've successfully signed in!");
        return res.redirect('/');
      });
    })(req, res, next);

    // , (req, res, function () {
    //   console.log('----------In login')
    //   if(!req.user){
    //     req.flash("notice", "Sign in failed. Please try again.")
    //     //res.redirect(303,req.headers.referer);
    //     res.redirect("/users/login");
    //   } else {
    //     req.flash("notice", "You've successfully signed in!");
    //     res.redirect("/");
    //   }
    // });
    //next();
  },

  logout(req, res, next) {
    req.logout();
    req.flash("notice", "You've successfully logged out!");
    res.redirect("/");
  },

  upgradeForm(req, res, next) {
    if (!req.user) res.redirect('/');
    else res.render("users/upgrade");
  },

  upgrade(req, res, next) {
    if (!req.user) {
      req.flash("notice", "You have to be logged in to upgrade.");
      res.redirect("/users/login");
      return;
    }

    const token = req.body.stripeToken;
    const charge = stripe.charges.create({
      amount: 1500,
      currency: 'usd',
      description: 'Upgrade to premium account',
      source: token,
    }, (err, result) => {
      if (err) {
        console.log(err);
        req.flash("error", `${err.type} ${err.code} ${err.message}`);
        res.redirect(res.statusCode, "/");
      } else {
        userQueries.updateUser(req, { role: User.PREMIUM }, (err, user) => {

          if (err || user == null) {
            if (err) console.log(err);
            req.flash("notice", "Error upgrading to standard account.");
            res.redirect(404, "/");
          } else {
            req.flash("notice", "You are upgraded to premium account.");
            res.redirect("/");
          }
        });

      }
    });

  },

  downgradeForm(req, res, next) {
    if (!req.user) res.redirect('/');
    else res.render("users/downgrade", { referer: req.headers.referer });
  },

  downgrade(req, res, next) {
    if (!req.user) {
      req.flash("notice", "You have to be logged in to downgrade.");
      res.redirect("/users/login");
      return;
    }
    let proms = [], i = 0;

    wikiQueries.getPrivateWikis(req.user, (err, wikis) => {
      if (err) {
        console.log(err);
        req.flash("notice", "Error retrieving private wikis.");
        res.redirect(req.headers.referer);
        return;
      }

      wikis.forEach(wiki => {
        /* make all private wikis public */
        proms[i++] = wikiQueries.updateWiki(wiki, { private: false }, (err, wiki) => {
          if (err) {
            console.log(err);
            req.flash("notice", "Error setting private wikis public.");
            res.redirect(req.headers.referer);
            return;
          }
        })
        /* remove all collaborators */
        proms[i++] = wikiQueries.deleteCollaborators(wiki, (err, count) => {
          console.log(`${count} collaborators removed from wiki ${wiki.id}`);
          if (err) {
            console.log(err);
            req.flash("notice", "Deleting collaborators failed!");
            res.redirect("/");
            return;
          }
        })

      })

      Promise.all(proms).then((results) => {
        /* update user role */
        userQueries.updateUser(req, { role: User.STANDARD }, (err, user) => {
          if (err || user == null) {
            if (err) console.log(err);
            req.flash("notice", "Error downgrading to standard account.");
            res.redirect("/");
          } else {
            req.flash("notice", "You are downgraded to standard account.");
            res.redirect("/");
          }
        });
      })
    })
  }
}
