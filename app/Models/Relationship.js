'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class Relationship extends Model {
  static get table () {
    return 'relationships'
  }

  static get createdAtColumn () {
    return null;
  }

  static get updatedAtColumn () {
    return null;
  }
}

module.exports = Relationship
