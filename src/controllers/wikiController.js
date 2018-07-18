const wikiQueries = require("../db/queries.wikis");
const userQueries = require("../db/queries.users");
const Authorizer = require("../policies/wiki");
const markdown = require("markdown").markdown;

module.exports = {
  index(req, res, next) {
    wikiQueries.getPublicWikis((err, wikis) => {
      if (err) {
        console.log(err);
        req.flash("notice", "Error retrieving public wikis.");
        res.redirect(500, "/");
      } else {
        res.render("wikis/index", { wikis, markdown });
      }
    })
  },

  myWikis(req, res, next) {
    if (!req.user) {
      req.flash("notice", "You have to be logged in to view private wikis.");
      res.redirect(500, "/");
      return;
    }
    wikiQueries.getPrivateWikis(req.user, (err, wikis) => {
      if (err) {
        console.log(err);
        req.flash("notice", "Error retrieving private wikis.");
        res.redirect(500, "/");
      } else {
        const authorizer = new Authorizer(req.user, null);
        res.render("wikis/mywikis", { wikis, authorizer, markdown });
      }
    })
  },

  sharedWikis(req, res, next) {
    if (!req.user) {
      req.flash("notice", "You have to be logged in to view shared wikis.");
      res.redirect("/");
      return;
    }
    userQueries.getSharedWikis(req.user, (err, wikis) => {

      if (err) {
        console.log(err);
        req.flash("notice", "Error retrieving shared wikis.");
        res.redirect("/");
      } else {

        res.render("wikis/sharedWikis", { wikis, markdown });
      }
    })
  },

  new(req, res, next) {
    const authorizer = new Authorizer(req.user, null);
    if (authorizer.new()) {
      res.render("wikis/new", { authorizer });
    } else {
      req.flash("notice", "You have to be logged in to create new wikis.");
      res.redirect("/wikis");
    }
  },

  create(req, res, next) {
    const authorized = new Authorizer(req.user).create();

    if (authorized) {
      let newWiki = {
        title: req.body.title,
        body: req.body.body,
        userId: req.user.id,
        private: req.body.private
      };
      wikiQueries.addWiki(newWiki, (err, wiki) => {
        if (err) {
          console.log(err)
          req.flash("notice", "Creating wiki failed.");
          res.redirect(500, "/wikis/new");
        } else {
          req.flash("notice", "Wiki added.");
          res.redirect(303, `/wikis/${wiki.id}`);
        }
      });
    } else {
      req.flash("notice", "You are not authorized to do that.");
      res.redirect("/wikis");
    }
  },

  show(req, res, next) {

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        req.flash("notice", "Error loading wiki.");
        res.redirect(500, "/");
        return;
      } else {
        const authorizer = new Authorizer(req.user, wiki);
        if (wiki.private && authorizer._isOwner())
          res.render("wikis/show", { wiki, markdown, collaborators: wiki.collaborators, authorizer });
        else
          res.render("wikis/show", { wiki, markdown, collaborators: 'none', authorizer });
      }
    });
  },

  destroy(req, res, next) {

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        res.redirect(404, "/");
        return;
      }

      const authorized = new Authorizer(req.user, wiki).destroy();
      if (authorized) {
        wikiQueries.deleteWiki(wiki, (err, wiki) => {
          if (err) {
            console.log(err)
            req.flash("notice", "Deleting wiki failed.");
            res.redirect(err, `/wikis/${req.params.id}`)
          } else {
            req.flash("notice", "Wiki deleted.");
            res.redirect(303, "/wikis")
          }
        })
      } else {
        req.flash("notice", "You are not authorized to do that.")
        res.redirect(401, `/wikis/${req.params.id}`)
      }
    })
  },

  edit(req, res, next) {
    if (!req.user) {
      req.flash("notice", "You have to be logged in to edit wikis.");
      res.redirect(`/wikis/${req.params.id}`)
      return;
    }

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        res.redirect(404, "/");
      } else {
        const authorizer = new Authorizer(req.user, wiki);

        if (authorizer.edit()) {
          if (wiki.private) {
            userQueries.getAllUsers((err, users) => {
              if (err) {
                console.log(err);
                req.flash("notice", "Error retrieving user list.");
                res.render("wikis/edit", { wiki, users: 'none', collaborators: 'none', authorizer });
                return;
              }
              users.sort((a,b)=>{
                if (a.name < b.name) return -1;
                else if (a.name > b.name) return 1;
                else return 0;
              });

              let collaboratorIds = [];
              for (let index in wiki.collaborators) {
                collaboratorIds.push(wiki.collaborators[index].id);
              }
              res.render("wikis/edit", { wiki, users, collaborators: collaboratorIds, authorizer });
            })
          } else {
            res.render("wikis/edit", { wiki, users: 'none', collaborators: 'none', authorizer });
          }
        } else {
          req.flash("notice", "You are not authorized to edit this wiki.");
          res.redirect(`/wikis/${req.params.id}`)
        }
      }
    });
  },

  update(req, res, next) {

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        res.redirect(404, "/");
        return;
      }

      const authorized = new Authorizer(req.user, wiki).update();
      if (authorized) {
        wikiQueries.updateWiki(wiki, req.body, (err, wiki) => {
          if (err) {
            console.log(err)
            req.flash("notice", "Updating wiki failed!");
            res.redirect(404, `/wikis/${req.params.id}/edit`);
          } else {
            req.flash("notice", "Updating wiki succeeded!");
            res.redirect(`/wikis/${wiki.id}`);
          }
        })
      } else {
        req.flash("notice", "You are not authorized to update this wiki.")
        res.redirect(401, `/wikis/${req.params.id}`)
      }
    })

  },

  setPrivate(req, res, next) {

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        res.redirect(404, "/");
        return;
      }

      const authorized = new Authorizer(req.user, wiki).setPrivate();
      if (!authorized) {
        req.flash("notice", "You have to be the owner or admin to set this wiki private.");
        res.redirect(req.headers.referer);
        return;
      }

      wikiQueries.updateWiki(wiki, { private: true }, (err, wiki) => {
        if (err || wiki == null) {
          if (err) console.log(err)
          req.flash("notice", "Set private failed!");
          res.redirect(404, "/");
        } else {
          req.flash("notice", "Set private succeeded!");
          res.redirect(req.headers.referer);
        }
      })
    })
  },

  setPublic(req, res, next) {

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        res.redirect(404, "/");
        return;
      }

      const authorized = new Authorizer(req.user, wiki).setPublic();
      if (!authorized) {
        req.flash("notice", "Only the owner or admin can set this wiki public.");
        res.redirect(req.headers.referer);
        return;
      }

      wikiQueries.updateWiki(wiki, { private: false }, (err, wiki) => {
        if (err || wiki == null) {
          if (err) console.log(err)
          req.flash("notice", "Set public failed!");
          res.redirect(req.headers.referer);
        } else {
          //wiki has become public
          wikiQueries.deleteCollaborators(wiki, (err, wiki) => {
            if (err || wiki == null) {
              if (err) console.log(err)
              req.flash("notice", "Deleting collaborators failed!");
              res.redirect(req.headers.referer);
            } else {
              req.flash("notice", "Set public succeeded!");
              res.redirect(req.headers.referer);
            }
          })
        }
      })
    }) 
  },

  share(req, res, next) {
    if (!req.user) {
      req.flash("notice", "You have to be logged in to share wikis.");
      res.redirect(`/wikis/${req.params.id}`)
      return;
    }

    wikiQueries.getWiki(req.params.id, (err, wiki) => {
      if (err || wiki == null) {
        console.log(err)
        res.redirect(404, "/");
        return;
      }

      const authorized = new Authorizer(req.user, wiki).update();
      if (!authorized) {
        req.flash("notice", "You have to be the owner or admin to set this wiki private.");
        res.redirect(req.headers.referer);
        return;
      }

      let newCollaborators = [];
      for (let key in req.body) {
        if (req.body[key] == 'true') newCollaborators.push(key);
      }
      wikiQueries.updateCollaborators(wiki, newCollaborators, (err, result) => {
        if (err || result == null) {
          if (err) console.log(err)
          req.flash("notice", "Upating collaborators failed!");
          res.redirect(404, "/");
        } else {
          req.flash("notice", `${result[1].length} collaborator(s) set!`);
          res.redirect(`/wikis/${req.params.id}`)
        }
      })

    })
  }
}