'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class RelationshipsSchema extends Schema {
  up () {
    this.create('relationships', (table) => {
      table.increments()
      table.uuid('user_id_1',6).index()
      table.foreign('user_id_1').references('id').on('users').onDelete('cascade')
      table.uuid('user_id_2',6).index()
      table.foreign('user_id_2').references('id').on('users').onDelete('cascade')
      table.integer('status').notNullable
      table.uuid('last_action_user_id',6).index()
      table.foreign('last_action_user_id').references('id').on('users').onDelete('cascade')
    })
  }

  down () {
    this.drop('relationships')
  }
}

module.exports = RelationshipsSchema
