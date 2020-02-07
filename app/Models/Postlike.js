'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Postlike extends Model {
  static get table () {
    return 'post_likes'
  }

  static get createdAtColumn () {
    return null;
  }

  static get updatedAtColumn () {
    return null;
  }
}

module.exports = Postlike
