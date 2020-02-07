'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class NotificationSchema extends Schema {
  up () {
    this.create('notifications', (table) => {
      table.increments()
      table.string('type').notNullable().unique();
      table.uuid('target_id').index()
      table.uuid('sender_id').index()
      table.foreign('target_id').references('id').on('users').onDelete('cascade')
      table.foreign('sender_id').references('id').on('users').onDelete('cascade')
    })
  }

  down () {
    this.drop('notifications')
  }
}

module.exports = NotificationSchema
