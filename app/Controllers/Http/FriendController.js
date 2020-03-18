'use strict'

const Relationship = use('App/Models/Relationship')
const Notification = use('App/Models/Notification')
const User = use("App/Models/User");
const UserAvatar = use("App/Models/UserAvatar");



class FriendController {
  async sendFriendRequest({request, params, auth, response}) {
    const body = request.only(["senderId", "targetUserId"]);

    const relationship = new Relationship()
    relationship.user_id_1 = body.senderId
    relationship.user_id_2 = body.targetUserId
    relationship.status = 0
    relationship.last_action_user_id = body.senderId;

    relationship.save()

    const notification = new Notification()
    notification.type = 'FRIEND_REQUEST'
    notification.target_id = body.targetUserId
    notification.sender_id = body.senderId

    notification.save();



    return response.status(200).json({message: 'success'})


  }
  async acceptFriendRequest({request, params, auth, response}) {

    const body = request.only("userId");

    try {
      await Relationship.query().whereRaw('(user_id_1 = ? AND user_id_2 = ?)',[auth.user.id,body.userId]).orWhereRaw('(user_id_1 = ?  AND user_id_2 = ?)',[body.userId,auth.user.id]).update({
        'status': 1,
        'last_action_user_id': auth.user.id
      })
    }catch (e) {
      console.log(e)
      return response.status('500').json({
        error:'accepting friend request failed!'
      })
    }
  }
  async denyFriendRequest({request, params, auth, response}) {

  }
  async CancelFriendRequest({request, params, auth, response}) {

    await Relationship.query().whereRaw('(user_id_1 = ? AND user_id_2 = ?)',[auth.user.id,body.userId]).orWhereRaw('(user_id_1 = ?  AND user_id_2 = ?)',[body.userId,auth.user.id]).del()
  }
  async removeFriend({request, params, auth, response}) {

  }

  async getRelations({request, params, auth, response}){

    const body = request.only(["targetUserId"]);
    const query = Relationship.query()
    const data = await query.whereRaw('(user_id_1 = ? AND user_id_2 = ?)',[auth.user.id,body.targetUserId]).orWhereRaw('(user_id_1 = ?  AND user_id_2 = ?)',[body.targetUserId,auth.user.id]).first();

    if(!data){
      return response.status(404).json({
        status: "Error",
        message: "You don't have any relation with this user!"
      });
    }

    return response.status(200).json({
      status: "Success",
      data: data
    });

  }


  async getFriends({request, params, auth, response}){

    const friends = await Relationship.query().where("status",1).where("user_id_1", params.id).orWhere("user_id_2",params.id).fetch()
    const data = JSON.parse(JSON.stringify(friends))
    for(let friend of data) {
      let user;
      if(friend.user_id_1 === params.id){
         user = await User.query().where("id", friend.user_id_2).first()
      }else if(friend.user_id_2 === params.id){
         user = await User.query().where("id", friend.user_id_1).first()
      }
      friend.user =  JSON.parse(JSON.stringify(user));
      const userAvatar = await UserAvatar.query().where("user_id", user.id).where('isCurrentAvatar',1).first()
      friend.user.avatar = JSON.parse(JSON.stringify(userAvatar));
      delete friend.user.password


    }

    if(friends.length === 0){
      return response.status(404).json({
        status: "Error",
        message: "No friends"
      });
    }

    return response.status(200).json({
      status: "Success",
      data: data
    });

  }


}

module.exports = FriendController
