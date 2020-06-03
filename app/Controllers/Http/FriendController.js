'use strict'

const {validate} = use('Validator');
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

    return response.status(200).json({message: 'success'})


  }
  async acceptFriendRequest({request, params, auth, response}) {

    const body = request.only("senderId");

    try {
      await Relationship.query().where('user_id_1',body.senderId).where('user_id_2',auth.user.id).update({
        'status': 1,
        'last_action_user_id': auth.user.id
      })
      return response.status(200).json({
        status: "success",
        message: "Accepted friend request"
      });
    }catch (e) {
      console.log(e)
      return response.status(500).json({
        status: "Error",
        message: "Error happened"
      });
    }
  }
  async denyFriendRequest({request, params, auth, response}) {

    const rules = {
      userId: "required",
    };

    const body = request.only(['userId'])

    const validation = await validate(body, rules);

    if (validation.fails()) {
      return response.status(400).json({
        status: "Error",
        message: validation.messages()
      });
    }
    try{
      await Relationship.query().whereRaw('(user_id_1 = ? AND user_id_2 = ?)',[auth.user.id,body.userId]).orWhereRaw('(user_id_1 = ?  AND user_id_2 = ?)',[body.userId,auth.user.id]).delete()
      return response.status(200).json({
        status: "Success",
        message: 'Denied request!'
      });
    }catch (e) {
      console.log(e)
      return response.status(500).json({
        status: "Error",
        message: e.message
      });
    }
  }
  async CancelFriendRequest({request, params, auth, response}) {

    const rules = {
      userId: "required",
    };

    const body = request.only(['userId'])

    const validation = await validate(body, rules);

    if (validation.fails()) {
      return response.status(400).json({
        status: "Error",
        message: validation.messages()
      });
    }
    try{
      await Relationship.query().whereRaw('(user_id_1 = ? AND user_id_2 = ?)',[auth.user.id,body.userId]).orWhereRaw('(user_id_1 = ?  AND user_id_2 = ?)',[body.userId,auth.user.id]).delete()
      return response.status(200).json({
        status: "Success",
        message: 'Cancelled request!'
      });
    }catch (e) {
      console.log(e)
      return response.status(500).json({
        status: "Error",
        message: e.message
      });
    }
  }
  async removeFriend({request, params, auth, response}) {
    const rules = {
      userId: "required",
    };

    const body = request.only(['userId'])

    const validation = await validate(body, rules);

    if (validation.fails()) {
      return response.status(400).json({
        status: "Error",
        message: validation.messages()
      });
    }
    try{
      await Relationship.query().whereRaw('(user_id_1 = ? AND user_id_2 = ?)',[auth.user.id,body.userId]).orWhereRaw('(user_id_1 = ?  AND user_id_2 = ?)',[body.userId,auth.user.id]).where('status',1).delete()
      return response.status(200).json({
        status: "Success",
        message: 'Deleted friend!'
      });
    }catch (e) {
      console.log(e)
      return response.status(500).json({
        status: "Error",
        message: e.message
      });
    }

  }

  async getRelations({request, params, auth, response}){

    const body = request.only(["targetUserId"]);
    const query = Relationship.query()
    const data = await query.whereRaw('(user_id_1 = ? AND user_id_2 = ?)',[auth.user.id,body.targetUserId]).orWhereRaw('(user_id_1 = ?  AND user_id_2 = ?)',[body.targetUserId,auth.user.id]).first();

    if(!data){
      return response.status(204).json({
        status: "Error",
        data: data
      });
    }

    return response.status(200).json({
      status: "Success",
      data: data
    });

  }


  async getFriends({request, params, auth, response}){

    const friends = await Relationship.query().where("status",1).whereRaw("(user_id_1 = ? OR user_id_2 = ?)",[params.id,params.id]).fetch()
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

    if(data.length === 0){
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
  async getFriendRequests({request, params, auth, response}){

    const friendRequests = await Relationship.query().where("status",0).where('user_id_2', auth.user.id).fetch()
    const requests = JSON.parse(JSON.stringify(friendRequests))
    for(let request of requests) {
      let sender = await User.query().where("id", request.user_id_1).first()
      request.sender = JSON.parse(JSON.stringify(sender));
      const senderAvatar = await UserAvatar.query().where("user_id", sender.id).where('isCurrentAvatar',1).first()
      request.sender.avatar = JSON.parse(JSON.stringify(senderAvatar));
      delete request.sender.password
    }
    if(requests.length === 0){
      return response.status(404).json({
        status: "Error",
        message: "No requests"
      });
    }

    return response.status(200).json({
      status: "Success",
      data: requests
    });


  }


}

module.exports = FriendController
