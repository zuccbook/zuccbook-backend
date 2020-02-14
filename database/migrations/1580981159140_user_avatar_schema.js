'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserAvatarSchema extends Schema {
  up () {
    this.create('user_avatars', (table) => {
      table.increments()
      table.string('path').notNullable()
      table.uuid('user_id').index()
      table.foreign('user_id').references('id').on('users').onDelete('cascade')
      table.integer('isCurrentAvatar').notNullable
    })
  }

  down () {
    this.drop('user_avatars')
  }
}

module.exports = UserAvatarSchema
