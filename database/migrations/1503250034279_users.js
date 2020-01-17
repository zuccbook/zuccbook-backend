'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.uuid("id").notNullable().primary();
      table.string("firstname", 45).notNullable();
      table.string("lastname", 45).notNullable();
      table.string("email").notNullable().unique();
      table.string("gender",45).notNullable();
      table.string("birthday",45).notNullable();
      table.string("password").notNullable();
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
