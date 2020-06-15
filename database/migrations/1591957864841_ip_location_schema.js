'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class IpLocationSchema extends Schema {
  up () {
    this.create('ip_locations', (table) => {
        table.string('ip',100).primary().notNullable()
        table.string('location').notNullable()
    })
  }

  down () {
    this.drop('ip_locations')
  }
}

module.exports = IpLocationSchema
