'use strict'

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

class PrivacySetting extends Model {
  static get table () {
    return 'privacy_settings'
  }

  static get createdAtColumn () {
    return null;
  }

  static get updatedAtColumn () {
    return null;
  }
}

module.exports = PrivacySetting
