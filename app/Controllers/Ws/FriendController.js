'use strict'
const Ws = use('Ws')
const Relationship = use("App/Models/Relationship")
const User = use("App/Models/User")
const UserStatus = use("App/Models/UserStatus")
const UserAvatar = use("App/Models/UserAvatar")

class FriendController {
  constructor({socket, auth, request}) {
    this.socket = socket
    this.request = request
    this.auth = auth

    console.log(`${auth.user.firstname} connected, on ${socket.id}`)
    this.friendIsOnline()


  }

  async friendIsOnline() {
    const friends = await this.getFriends(this.auth.user.id)
    if (friends.length !== 0) {
      for (let friend of friends) {
        try {
          const user = await this.getSelf(1)
          await this.updateUserStatus()
          Ws.getChannel('friends:*').topic(`friends:${friend.user.id}`).broadcastToAll(`FRIEND_ONLINE`, user)

        } catch (e) {
          console.log(e)
        }
      }

    }
  }

  async updateUserStatus(status) {
    await UserStatus.query().where("user_id", this.auth.user.id).update("status", status)
  }

  async getSelf() {
    const user = JSON.parse(JSON.stringify(this.auth.user))
    const avatar = await UserAvatar.query().where("user_id", user.id).first();
    user.avatar = JSON.parse(JSON.stringify(avatar))
    delete user.password
    console.log(user)
    return user


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

  async friendIsOffline() {
    const friends = await this.getFriends(this.auth.user.id)
    if (friends.length !== 0) {
      for (let friend of friends) {
        try {
          const user = await this.getSelf()
          await this.updateUserStatus(0)
          Ws.getChannel('friends:*').topic(`friends:${friend.user.id}`).broadcastToAll(`FRIEND_OFFLINE`, user)

        } catch (e) {
          console.log(e)
        }
      }

    }
  }
  onDisconnect() {
    this.friendIsOffline()
    console.log(this.auth.user.firstname + " went offline")
  }
}

module.exports = FriendController
