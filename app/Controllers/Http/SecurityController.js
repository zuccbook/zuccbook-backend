'use strict'
const IpLocation = use("App/Models/IpLocation")
const DBUser = use("App/Models/User")
const SecurityLog = use("App/Models/SecurityLog")

class SecurityController {

  async getSecurityLogFromUser({request, params, auth, response}){

    const securityLog = await SecurityLog.query().select("slg.id as log_id","event_type","log","slg.ip","date","ipl.location").from("security_logs as slg").where("user_id",auth.user.id)
      .innerJoin("events as evnt", "event_id", "evnt.id")
      .innerJoin("users as usr","user_id","usr.id")
      .innerJoin("ip_locations as ipl","ipl.ip","slg.ip").orderBy("date","desc").fetch()

    return response.status(200).json({
      status:"success",
      securityLog:securityLog
    })


  }

}

module.exports = SecurityController
