'use strict'


const Ws = use('Ws')

Ws.channel('event:*', 'EventController')
  .middleware(['auth'])
Ws.channel('friends:*', 'FriendController')
  .middleware(['auth'])

