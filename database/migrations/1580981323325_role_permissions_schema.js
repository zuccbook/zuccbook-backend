'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RolePermissionsSchema extends Schema {
  up () {
    this.create('role_permissions', (table) => {
      table.increments()
      table.integer('role_id').unsigned().index()
      table.integer('permission_id').unsigned().index()
      table.foreign('role_id').references('id').on('roles').onDelete('cascade')
      table.foreign('permission_id').references('id').on('permissions').onDelete('cascade')
    })
  }

  down () {
    this.drop('role_permissions')
  }
}

module.exports = RolePermissionsSchema
