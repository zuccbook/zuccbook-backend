'use strict'
const Relationship = use('App/Models/Relationship')
const Notification = use('App/Models/Notification')


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

  }
  async denyFriendRequest({request, params, auth, response}) {

  }
  async removeFriend({request, params, auth, response}) {

  }

  async getRelations({request, params, auth, response}){
    const body = request.only(["targetUserId"]);

    const data = await Relationship.query().where("user_id_2", body.targetUserId).where("user_id_1",auth.user.id).first()

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





}

module.exports = FriendController
