'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class BlocklistSchema extends Schema {
  up () {
    this.create('blocklists', (table) => {
      table.increments().notNullable();
      table.uuid('blocker_id',6).index().notNullable();
      table.foreign('blocker_id').references('id').on('users').onDelete('cascade')
      table.uuid('blocked_user_id',6).index().notNullable();
      table.foreign('blocked_user_id').references('id').on('users').onDelete('cascade')
    })
  }

  down () {
    this.drop('blocklists')
  }
}

module.exports = BlocklistSchema
