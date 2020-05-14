'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserAvatar extends Model {
  static get table () {
    return 'user_avatars'
  }

  static get createdAtColumn () {
    return null;
  }

  static get updatedAtColumn () {
    return null;
  }

  Users() {
    return this.belongsToMany("App/Models/User")
      .pivotModel("App/Models/PrivacySetting");

  }
}


module.exports = UserAvatar
