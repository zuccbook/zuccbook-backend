'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserStatusSchema extends Schema {
  up () {
    this.create('user_statuses', (table) => {
      table.uuid('user_id',6).index().notNullable();
      table.foreign('user_id').references('id').on('users').onDelete('cascade')
      table.integer('status')
    })
  }

  down () {
    this.drop('user_statuses')
  }
}

module.exports = UserStatusSchema
