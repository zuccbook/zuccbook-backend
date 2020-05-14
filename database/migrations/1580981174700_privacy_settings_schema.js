'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PrivacySettingsSchema extends Schema {
  up () {
    this.create('privacy_settings', (table) => {
      table.uuid('user_id').index()
      table.foreign('user_id').references('id').on('users').onDelete('cascade')
      table.string('profile_privacy').notNullable()
      table.string("who_can_add").notNullable()
    })
  }

  down () {
    this.drop('privacy_settings')
  }
}

module.exports = PrivacySettingsSchema
