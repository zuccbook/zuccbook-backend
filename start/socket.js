'use strict'


const Ws = use('Ws')

Ws.channel('event', 'EventController')
  .middleware(['auth'])
