'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class UserAvatar extends Model {
  static get table () {
    return 'user_avatar'
  }

  static get createdAtColumn () {
    return null;
  }

  static get updatedAtColumn () {
    return null;
  }
}


module.exports = UserAvatar
