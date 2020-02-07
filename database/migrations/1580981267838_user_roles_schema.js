'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserRolesSchema extends Schema {
  up () {
    this.create('user_roles', (table) => {
      table.increments()
      table.integer('role_id').unsigned().index()
      table.foreign('role_id').references('id').on('roles').onDelete('cascade')
      table.uuid('user_id').index()
      table.foreign('user_id').references('id').on('users').onDelete('cascade')
    })
  }

  down () {
    this.table('role_user', function (table) {

      table.dropForeign('role_id');
      table.dropForeign('user_id');
    })

    this.drop('user_roles')

  }
}

module.exports = UserRolesSchema
