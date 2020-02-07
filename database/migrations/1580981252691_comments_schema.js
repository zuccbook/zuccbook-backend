'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class CommentsSchema extends Schema {
  up () {
    this.create('comments', (table) => {
      table.increments()
      table.string("comment_content")
      table.uuid('users_id').index()
      table.integer('post_id',10).unsigned().index()
      table.foreign('users_id').references('id').on('users').onDelete('cascade')
      table.foreign('post_id').references('id').on('posts').onDelete('cascade')
    })
  }

  down () {
    this.drop('comments')
  }
}

module.exports = CommentsSchema
