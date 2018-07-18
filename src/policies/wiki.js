const ApplicationPolicy = require('./application');

module.exports = class Policy extends ApplicationPolicy {
 
  setPrivate() {
    return this._isAdmin() || (this._isPremium() && (this._isOwner() || !this.record) );
  }

  setPublic() {
    return this.setPrivate();
  }

  setCollaborators(){
    return this.setPrivate();
  }

}
