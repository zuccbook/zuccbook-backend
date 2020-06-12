'use strict'

/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class EventSchema extends Schema {
  up () {
    this.create('events', (table) => {
      table.increments()
      table.string('event_type').notNullable()


    })
  }

  down () {
    this.drop('events')
  }
}

module.exports = EventSchema
