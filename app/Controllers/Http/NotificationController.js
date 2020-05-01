'use strict'
const Notification = use('App/Models/Notification')
const User = use('App/Models/User')
const UserAvatar = use('App/Models/UserAvatar')


class NotificationController {

  async getAllNotifications ({request, params, auth, response}) {
    const databaseNotifications = await Notification.query().where('target_id', auth.user.id).fetch()
    const notifications = JSON.parse(JSON.stringify(databaseNotifications))
    if (notifications.length !== 0) {
      for (let notification of notifications) {
        const user = await User.query().where('id', notification.sender_id).first()
        const userAvatar = await  UserAvatar.query().where('user_id',notification.sender_id).where('isCurrentAvatar',1).first()
        notification.sender = JSON.parse(JSON.stringify(user))
        notification.sender.avatar = JSON.parse(JSON.stringify(userAvatar))
      }
      console.log(notifications)

      return response.status(200).json({
        status:'success',
        data:notifications
      })
    }else{
      return response.status(404).json({
        status:'error',
        message:'nothing found'
      })
    }

  }

  async getUnreadNotifications({request, params, auth, response}) {
    const notifications = await Notification.query().count('* as notification_count')
      .where('target_id', auth.user.id)
      .where('is_read', 0).first()

    if(!notifications){
      return response.status(404).json({
        status:'success',
        message:'none'
      })
    }
    return response.status(200).json({
      status:'success',
      notification_count:notifications.notification_count
    })

  }
}

module.exports = NotificationController
