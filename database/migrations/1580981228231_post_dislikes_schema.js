'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostDislikesSchema extends Schema {
  up () {
    this.create('post_dislikes', (table) => {
      table.increments()
      table.uuid('user_id').index()
      table.integer('post_id',10).unsigned().index()
      table.foreign('user_id').references('id').on('users').onDelete('cascade')
      table.foreign('post_id').references('id').on('posts').onDelete('cascade')
    })
  }

  down () {
    this.drop('post_dislikes')
  }
}

module.exports = PostDislikesSchema
