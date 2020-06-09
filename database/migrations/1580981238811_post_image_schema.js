'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PostImageSchema extends Schema {
  up () {
    this.create('post_images', (table) => {
      table.increments()
      table.string('path').notNullable()
      table.integer('post_id',10).unsigned().index()
      table.foreign('post_id').references('id').on('posts').onDelete('cascade')

    })
  }

  down () {
    this.drop('post_images')
  }
}

module.exports = PostImageSchema
