const User = require ("../db/models/").User;
const wikiQueries = require("../db/queries.wikis");

module.exports = class ApplicationPolicy {

  constructor(user, record) {
    this.user = user;
    this.record = record;
  }

  _isOwner() {
    return this.record && this.user && (this.record.userId == this.user.id);
  }

  _isAdmin() {
    return this.user && this.user.role == User.ADMIN;
  }

  _isPremium() {
    return this.user && this.user.role == User.PREMIUM;
  }

  _isCollaborator() {
    if (!this.record.collaborators) return false;
    if (this.record.collaborators.map(rec=>{return rec.id}).indexOf(this.user.id) >= 0) return true;
    else return false;
  }

  new() {
    return this.user != null;
  }

  create() {
    return this.new();
  }

  show() {
    return !this.record.private || _isCollaborator();
  }

  edit() {
    return this._isOwner() || this._isAdmin() || this._isCollaborator();
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this._isOwner() || this._isAdmin();
  }
}
