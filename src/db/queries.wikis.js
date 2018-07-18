const Wiki = require("./models").Wiki;
const User = require("./models").User;
const UserWiki = require("./models").UserWiki;

module.exports = {
  getPublicWikis(callback) {
    return Wiki.all({where: {private: false}})
      .then((wikis) => {
        callback(null, wikis);
      })
      .catch((err) => {
        callback(err);
      })
  },

  getPrivateWikis(user, callback) {
    let option={};
    if (user.isAdmin()) option = {where: {private: true}};
    else option = { 
      where: {userId: user.id, private: true},
      include: [{model: User, as: "collaborators"}] 
    };

    return Wiki.all(option)
      .then((wikis) => {
        callback(null, wikis);
      })
      .catch((err) => {
        callback(err);
      })
  },

  addWiki(newWiki, callback) {
    return Wiki.create({
      title: newWiki.title,
      body: newWiki.body,
      userId: newWiki.userId,
      private: newWiki.private
    })
      .then((wiki) => {
        callback(null, wiki);
      })
      .catch((err) => {
        callback(err);
      })
  },

  getWiki(id, callback) {
    return Wiki.findById(id, {
      include: [
        {model: User,
         as: "creator"}, 
        {model: User,
         as: "collaborators"}
        ]
    })
      .then((wiki) => {
        callback(null, wiki);
      })
      .catch((err) => {
        callback(err);
      })
  },

  deleteWiki(wiki, callback) {
    return wiki.destroy()
      .then((res) => {
        callback(null, wiki);
      })
      .catch((err) => {
        callback(err);
      });
  },

  updateWiki(wiki, updatedWiki, callback) {
    return wiki.update(updatedWiki, {
      fields: Object.keys(updatedWiki)
    })
      .then(() => {
        callback(null, wiki);
      })
      .catch((err) => {
        callback(err);
      });
  },

  updateCollaborators(wiki, updatedCollaborators, callback){
    return wiki.setCollaborators(updatedCollaborators)
      .then((result) => {
      callback(null, result);
    }).catch((err) => {
      callback(err);
    });
  },

  deleteCollaborators(wiki, callback){
    return wiki.removeCollaborators(wiki.collaborators.map(val=>{return val.id}))
      .then((count) => {
        callback(null, count);
      })
      .catch((err) => {
        callback(err);
      });
  }
}