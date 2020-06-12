'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SecurityLogSchema extends Schema {
  up () {
    this.create('security_logs', (table) => {
      table.increments()
      table.string('log').notNullable()
      table.date('date').notNullable()

      table.uuid('event_id',6).index().notNullable();
      table.foreign('event_id').references('id').on('events').onDelete('cascade')

      table.uuid('user_id',6).index().notNullable();
      table.foreign('user_id').references('id').on('users').onDelete('cascade')

      table.uuid('ip_location_id',6).index().notNullable();
      table.foreign('ip_location_id').references('ip').on('ip_locations').onDelete('cascade')
    })
  }

  down () {
    this.drop('security_logs')
  }
}
/*
*  table.uuid('admin_id',6).index().notNullable();
      table.foreign('admin_id').references('id').on('users').onDelete('cascade')
* */
module.exports = SecurityLogSchema
