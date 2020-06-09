'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class UserBannerSchema extends Schema {
  up () {
    this.create('user_banners', (table) => {
      table.increments()
      table.string('path').notNullable()
      table.uuid('user_id',6).index().notNullable()
      table.foreign('user_id').references('id').on('users').onDelete('cascade')
      table.integer('isCurrentBanner').notNullable()
    })
  }

  down () {
    this.drop('user_banners')
  }
}

module.exports = UserBannerSchema
