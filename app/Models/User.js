'use strict';

const Hash = use("Hash");

const uuidv4 = require("uuid/v4");

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model');

class User extends Model {
  static boot() {
    super.boot();

    this.addHook("beforeCreate", async (userInstance) => {

      userInstance.id = uuidv4();

      userInstance.password = await Hash.make(userInstance.password);
    });

    this.addHook("beforeUpdate", async (userInstance) => {
      if(userInstance === this.password)
        return;

      userInstance.password = await Hash.make(userInstance.password);
    });
  }

  static get incrementing () {
    return false
  }

  static get createdAtColumn () {
    return null;
  }

  static get updatedAtColumn () {
    return null;
  }

  groups() {
    return this.belongsToMany("App/Models/Role")
      .pivotModel("App/Models/RoleUser");
  }
}

module.exports = User;
