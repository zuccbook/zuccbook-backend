'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CommentsSchema extends Schema {
  up () {
    this.create('comments', (table) => {
      table.increments()
      table.string("comment_content").notNullable()
      table.dateTime('dateposted').notNullable();
      table.uuid('users_id',6).index().notNullable()
      table.integer('post_id',10).unsigned().index().notNullable()
      table.foreign('users_id').references('id').on('users').onDelete('cascade')
      table.foreign('post_id').references('id').on('posts').onDelete('cascade')
      table.integer("edited").defaultTo(0).notNullable();

    })
  }

  down () {
    this.drop('comments')
  }
}

module.exports = CommentsSchema
