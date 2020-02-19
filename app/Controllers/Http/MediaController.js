'use strict'
const fs = use('fs')
const Helpers = use('Helpers')
const UserAvatar = use("App/Models/UserAvatar");
const readFile = Helpers.promisify(fs.readFile)

class MediaController {
  async getUserAvatar({request, params, auth, response}) {
    let path = '/' + params.userid + '/' + params.image
    return await readFile("./store/user" + path)

  }
}

module.exports = MediaController
