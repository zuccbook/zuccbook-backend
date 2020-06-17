'use strict'

const Event = use('Event')
const Database = use("Database")
const SecurityEvent = use("App/Models/Event")
const IpLocation = use("App/Models/IpLocation")
const DBUser = use("App/Models/User")
const SecurityLog = use("App/Models/SecurityLog")


const User = exports = module.exports = {}
User.login = async (user) => {
  const usr = await DBUser.query().where("email",user.email).first()
  if(usr){
    const ip = await IpLocation.query().where("ip",user.ip).first()
    if(!ip){
      const ipLocation = new IpLocation()
      ipLocation.ip = user.ip
      ipLocation.location = "unknown"
      ipLocation.save()
    }
    const securityLog = new SecurityLog()
    securityLog.log = "A client or person logged into your account"
    securityLog.date = user.datetime
    securityLog.event_id = 1
    securityLog.user_id = usr.id
    securityLog.ip = user.ip
    securityLog.save()
  }
}
User.loginFail = async (user) => {
  const usr = await DBUser.query().where("email",user.email).first()
  if(usr){
    const ip = await IpLocation.query().where("ip",user.ip).first()
    if(!ip){
      const ipLocation = new IpLocation()
      ipLocation.ip = user.ip
      ipLocation.location = "unknown"
      ipLocation.save()
    }
    const securityLog = new SecurityLog()
    securityLog.log = "A client or person tried to login into your account"
    securityLog.date = user.datetime
    securityLog.event_id = 2
    securityLog.user_id = usr.id
    securityLog.ip = user.ip
    securityLog.save()
  }
}
