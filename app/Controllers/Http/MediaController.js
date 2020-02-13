'use strict'
const fs = use('fs')
const Helpers = use('Helpers')
const UserAvatar = use("App/Models/UserAvatar");

class MediaController {
  async getUserAvatar({request, params, auth, response}) {
    const image = await UserAvatar.query().where("path",params.path).first()

    return await fs.readFile("../"+image.path)
  }
}

module.exports = MediaController
