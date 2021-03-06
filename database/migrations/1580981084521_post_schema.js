'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostSchema extends Schema {
  up () {
    this.create('posts', (table) => {
       table.increments().notNullable
       table.string('text',600).notNullable();
       table.dateTime('dateposted').notNullable();
       table.uuid('poster_id',6).index().notNullable();
       table.foreign('poster_id').references('id').on('users').onDelete('cascade')
       table.integer("edited").defaultTo(0).notNullable();
    })
  }

  down () {
    this.drop('posts')
  }
}

module.exports = PostSchema
