'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SuspendedListSchema extends Schema {
  up () {
    this.create('suspended_lists', (table) => {
      table.increments()
      table.uuid('suspended_user_id',6).index().notNullable();
      table.foreign('suspended_user_id').references('id').on('users').onDelete('cascade')
      table.uuid('admin_id',6).index().notNullable();
      table.foreign('admin_id').references('id').on('users').onDelete('cascade')
      table.string('reason',6).notNullable();
      table.date('suspended_until').notNullable();


    })
  }

  down () {
    this.drop('suspended_lists')
  }
}

module.exports = SuspendedListSchema
