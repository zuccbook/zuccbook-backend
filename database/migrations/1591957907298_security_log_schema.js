'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class SecurityLogSchema extends Schema {
  up () {
    this.create('security_logs', (table) => {
      table.increments()
      table.string('log').notNullable()
      table.date('date').notNullable()

      table.integer('event_id',10).index().notNullable().unsigned();
      table.foreign('event_id').references('id').on('events').onDelete('cascade')

      table.uuid('user_id',6).index().notNullable();
      table.foreign('user_id').references('id').on('users').onDelete('cascade')

      table.string('ip',100).index().notNullable();
      table.foreign('ip').references('ip').on('ip_locations').onDelete('cascade')
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
