'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostSchema extends Schema {
  up () {
    this.create('posts', (table) => {
       table.increments().notNullable
       table.string('text').notNullable();
       table.date('dateposted').notNullable();
       table.uuid('poster_id').index()
       table.foreign('poster_id').references('id').on('users').onDelete('cascade')
    })
  }

  down () {
    this.drop('posts')
  }
}

module.exports = PostSchema
