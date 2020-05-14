'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostLikesSchema extends Schema {
  up () {
    this.create('post_likes', (table) => {
      table.uuid('user_id',6).index()
      table.foreign('post_id').references('id').on('posts').onDelete('cascade')
      table.integer('post_id',10).unsigned().index()
      table.foreign('user_id').references('id').on('users').onDelete('cascade')
    })
  }

  down () {
    this.drop('post_likes')
  }
}

module.exports = PostLikesSchema
