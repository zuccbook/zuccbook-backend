'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserRolesSchema extends Schema {
  up () {
    this.create('role_user', (table) => {
      table.increments()
      table.integer('role_id').unsigned().index()
      table.foreign('role_id').references('id').on('roles').onDelete('cascade')
      table.uuid('user_id',6).index()
      table.foreign('user_id').references('id').on('users').onDelete('cascade')
    })
  }

  down () {
    this.table('role_user', function (table) {

      table.dropForeign('role_id');
      table.dropForeign('user_id');
    })

    this.drop('role_user')

  }
}

module.exports = UserRolesSchema
