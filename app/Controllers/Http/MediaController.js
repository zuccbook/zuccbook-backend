'use strict'

const imageType = require('image-type');

const fs = use('fs')
const Helpers = use('Helpers')
const UserAvatar = use("App/Models/UserAvatar");
const readFile = Helpers.promisify(fs.readFile)

class MediaController {
  async getUserAvatar({request, params, auth, response}) {
    let path = '/' + params.userid + '/' + params.image
     const data = await readFile("./store/user" + path)
    const result = imageType(data);

    return response.status(200).header('Content-type', result.mime).send(data)
  }
}

module.exports = MediaController
