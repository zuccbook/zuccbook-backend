'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.uuid("id",6).notNullable().primary();
      table.string("firstname", 45).notNullable();
      table.string("lastname", 45).notNullable();
      table.string("email",45).notNullable().unique();
      table.string("gender",45).notNullable();
      table.string("birthday",45).notNullable();
      table.string("password",255).notNullable();
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
