'use strict'
const Ws = use('Ws')

const Relationship = use("App/Models/Relationship")
const User = use("App/Models/User")


class EventController {
  constructor({socket, auth, request}) {
    this.socket = socket
    this.request = request
    this.auth = auth

    console.log(`${auth.user.firstname} connected, on ${socket.id}`)

    socket.on('POST_CREATE', (e) => this.onPostCreate(auth.user.id, e))
    socket.on('POST_DELETE', (e) => this.onPostDelete(auth.user.id, e))
    socket.on('NEW_FRIEND_REQUEST', (e) => this.onFriendRequest(e))
    socket.on('ACCEPTED_INCOMING_REQUEST', (e) => this.onAcceptedFriendRequest(e))
    socket.on('DENIED_INCOMING_REQUEST', (e) => this.onDeniedFriendRequest(e))
    socket.on('CANCELLED_INCOMING_REQUEST', (e) => this.onCancelFriendRequest(e))
    socket.on('DELETED_FRIEND', (e) => this.onDeletedFriend(e))
    socket.on('POST_LIKED', (e) => this.onPostlike(auth.user.id,e))
    socket.on('POST_UNLIKED', (e) => this.onUnlike(auth.user.id,e))
    socket.on('POST_DISLIKED', (e) => this.onDislike(auth.user.id,e))
    socket.on('POST_UNDISLIKED', (e) => this.onUnDislike(auth.user.id,e))
    socket.on('POST_EDIT', (e) => this.onPostEdit(auth.user.id,e))
    socket.on('COMMENT_CREATE', (e) => this.onCommentCreate(auth.user.id,e))
    socket.on('COMMENT_DELETE', (e) => this.onCommentDelete(auth.user.id,e))
    socket.on('COMMENT_EDIT', (e) => this.onCommentEdit(auth.user.id,e))



  }

  async getConnections(authUserId){
    const databaseData = await WsConnection.query().where("user_id", authUserId).first()
    return JSON.parse(JSON.stringify(databaseData))

  }

  async onPostCreate(userId, e) {
    const friends = await this.getFriends(userId)
      if (friends.length !== 0) {
        for (let friend of friends) {
          try {
            Ws.getChannel('event:*').topic(`event:${friend.user.id}`).broadcastToAll('NEW_POST', e.firstname)
          } catch (e) {
          }
        }
        Ws.getChannel('event:*').topic(`event:${userId}`).broadcastToAll('NEW_POST', e.firstname)

      } else if (friends.length === 0) {
        Ws.getChannel('event:*').topic(`event:${userId}`).broadcastToAll('NEW_POST', e.firstname)

      }


  }

  async onPostDelete(AuthUserId, e) {

    const friends = await this.getFriends(AuthUserId)
    console.log(friends)
    if (friends.length !== 0) {
      for (let friend of friends) {
        try {
          Ws.getChannel('event:*').topic(`event:${friend.user.id}`).broadcastToAll('POST_DELETE', e.firstname)
        } catch (e) {
        }

      }
      Ws.getChannel('event:*').topic(`event:${userId}`).broadcastToAll('POST_DELETE', e.firstname)

    } else if (friends.length === 0) {
      Ws.getChannel('event:*').topic(`event:${userId}`).broadcastToAll('POST_DELETE', e.firstname)

    }

  }


  async onFriendRequest(e) {
    try {
      Ws.getChannel('event:*').topic(`event:${e.targetUserId}`).broadcastToAll('SENT_REQUEST', e.firstname)
    } catch (e) {
    }
    try {
      Ws.getChannel('event:*').topic(`event:${e.sender.id}`).broadcastToAll('SENT_REQUEST', '')
    } catch (e) {
    }

  }

  async onPostlike(AuthUserId,e) {
    const friends =  await this.getFriends(AuthUserId)
    if (friends.length !== 0) {
      for (let friend of friends){
        try{

          Ws.getChannel('event:*').topic(`event:${friend.user.id}`).broadcastToAll('POST_LIKED', e.firstname)

        }catch (e) {

        }
      }
      Ws.getChannel('event:*').topic(`event:${AuthUserId}`).broadcastToAll('POST_LIKED', e.firstname)


    } else if (friends.length === 0) {
      Ws.getChannel('event:*').topic(`event:${AuthUserId}`).broadcastToAll('POST_LIKED', e.firstname)

    }

  }
  async onUnlike(AuthUserId,e) {

    const friends =  await this.getFriends(AuthUserId)
      if (friends.length !== 0) {
        for (let friend of friends) {
          try{

            Ws.getChannel('event:*').topic(`event:${friend.user.id}`).broadcastToAll('POST_UNLIKED', e.firstname)

          }catch (e) {

          }
        }
        Ws.getChannel('event:*').topic(`event:${AuthUserId}`).broadcastToAll('POST_UNLIKED', e.firstname)


      } else if (friends.length === 0) {
        Ws.getChannel('event:*').topic(`event:${AuthUserId}`).broadcastToAll('POST_UNLIKED', e.firstname)


      }

  }
  async onDislike(AuthUserId,e) {

    const friends =  await this.getFriends(AuthUserId)
      if (friends.length !== 0) {
        for (let friend of friends) {
          try{

            Ws.getChannel('event:*').topic(`event:${friend.user.id}`).broadcastToAll('POST_DISLIKED', e.firstname)

          }catch (e) {

          }

        }
        Ws.getChannel('event:*').topic(`event:${AuthUserId}`).broadcastToAll('POST_DISLIKED', e.firstname)

      } else if (friends.length === 0) {
        Ws.getChannel('event:*').topic(`event:${AuthUserId}`).broadcastToAll('POST_DISLIKED', e.firstname)

      }
  }
  async onUnDislike(AuthUserId,e) {
    const friends =  await this.getFriends(AuthUserId)
    if (friends.length !== 0) {
        for (let friend of friends) {
          try{

            Ws.getChannel('event:*').topic(`event:${friend.user.id}`).broadcastToAll('POST_UNDISLIKED', e.firstname)

          }catch (e) {

          }
        }
        Ws.getChannel('event:*').topic(`event:${AuthUserId}`).broadcastToAll('POST_UNDISLIKED', e.firstname)

      } else if (friends.length === 0) {
        Ws.getChannel('event:*').topic(`event:${AuthUserId}`).broadcastToAll('POST_UNDISLIKED', e.firstname)
      }

  }
  async onCancelFriendRequest(e) {

    try {
      Ws.getChannel('event:*').topic(`event:${e.sender.id}`).broadcastToAll('FRIEND_REQUEST_CANCELLED', e.firstname)
    } catch (e) {
    }
    try {
      Ws.getChannel('event:*').topic(`event:${e.targetUserId}`).broadcastToAll('FRIEND_REQUEST_CANCELLED', e.firstname)
    } catch (e) {
    }

  }

  async onDeniedFriendRequest(e) {

    try {
      Ws.getChannel('event:*').topic(`event:${e.sender.id}`).broadcastToAll('FRIEND_REQUEST_DENIED', e.firstname)
    } catch (e) {
    }
    try {
      Ws.getChannel('event:*').topic(`event:${e.targetUserId}`).broadcastToAll('FRIEND_REQUEST_DENIED', e.firstname)
    } catch (e) {
    }

  }

  async onAcceptedFriendRequest(e) {

    try {
      Ws.getChannel('event:*').topic(`event:${e.sender.id}`).broadcastToAll('FRIEND_REQUEST_ACCEPTED', e.firstname)
    } catch (e) {
    }
    try {
      Ws.getChannel('event:*').topic(`event:${e.targetUserId}`).broadcastToAll('FRIEND_REQUEST_ACCEPTED', e.firstname)
    } catch (e) {
    }

  }
  async onDeletedFriend(e) {
    try {
      Ws.getChannel('event:*').topic(`event:${e.sender.id}`).broadcastToAll('DELETED_FRIEND', e.firstname)
    } catch (e) {
    }
    try {
      Ws.getChannel('event:*').topic(`event:${e.targetUserId}`).broadcastToAll('DELETED_FRIEND', e.firstname)
    } catch (e) {
    }

  }

  onClose(e) {
    console.log(`${auth.user.firstname} disconnected, on ${this.socket.id}`)

  }


  async getFriends(AuthUserId) {
    const friends = await Relationship.query().where("status", 1).whereRaw("(user_id_1 = ? OR user_id_2 = ?)", [AuthUserId, AuthUserId]).fetch()
    const data = JSON.parse(JSON.stringify(friends))
    if (data.length === 0) {
      return []
    }
    for (let friend of data) {
      let user;
      if (friend.user_id_1 === AuthUserId) {
        user = await User.query().where("id", friend.user_id_2).first()
      } else if (friend.user_id_2 === AuthUserId) {
        user = await User.query().where("id", friend.user_id_1).first()
      }
      friend.user = JSON.parse(JSON.stringify(user));
      delete friend.user.password

    }

    return data
  }
  async onPostEdit(id, e) {
    const friends = await this.getFriends(id)
    if (friends.length !== 0) {
      for (let friend of friends) {
        try {
          Ws.getChannel('event:*').topic(`event:${friend.user.id}`).broadcastToAll('POST_EDITED', e.firstname)
        } catch (e) {
        }
      }
      Ws.getChannel('event:*').topic(`event:${id}`).broadcastToAll('POST_EDITED', e.firstname)

    } else if (friends.length === 0) {
      Ws.getChannel('event:*').topic(`event:${id}`).broadcastToAll('POST_EDITED', e.firstname)

    }
  }

  async onCommentCreate(id, e) {
    const friends = await this.getFriends(id)
    if (friends.length !== 0) {
      for (let friend of friends) {
        try {
          Ws.getChannel('event:*').topic(`event:${friend.user.id}`).broadcastToAll('COMMENT_CREATED', e.firstname)
        } catch (e) {
        }
      }
      Ws.getChannel('event:*').topic(`event:${id}`).broadcastToAll('COMMENT_CREATED', e.firstname)

    } else if (friends.length === 0) {
      Ws.getChannel('event:*').topic(`event:${id}`).broadcastToAll('COMMENT_CREATED', e.firstname)

    }
  }

  async onCommentDelete(id, e) {
    const friends = await this.getFriends(id)
    if (friends.length !== 0) {
      for (let friend of friends) {
        try {
          Ws.getChannel('event:*').topic(`event:${friend.user.id}`).broadcastToAll('COMMENT_DELETED', e.firstname)
        } catch (e) {
        }
      }
      Ws.getChannel('event:*').topic(`event:${id}`).broadcastToAll('COMMENT_DELETED', e.firstname)

    } else if (friends.length === 0) {
      Ws.getChannel('event:*').topic(`event:${id}`).broadcastToAll('COMMENT_DELETED', e.firstname)

    }

  }

  async onCommentEdit(id, e) {
    const friends = await this.getFriends(id)
    if (friends.length !== 0) {
      for (let friend of friends) {
        try {
          Ws.getChannel('event:*').topic(`event:${friend.user.id}`).broadcastToAll('COMMENT_EDITED', e.firstname)
        } catch (e) {
        }
      }
      Ws.getChannel('event:*').topic(`event:${id}`).broadcastToAll('COMMENT_EDITED', e.firstname)

    } else if (friends.length === 0) {
      Ws.getChannel('event:*').topic(`event:${id}`).broadcastToAll('COMMENT_EDITED', e.firstname)

    }
  }


}

module.exports = EventController
