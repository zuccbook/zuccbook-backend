'use strict'

const imageType = require('image-type');
const FileType = require('file-type');
const os = require("os");
const fs = use('fs')
const Helpers = use('Helpers')

const readFile = Helpers.promisify(fs.readFile)

class MediaController {
  async getUserAvatar({request, params, auth, response}) {
    let path = `/${params.userid}/avatars/${params.image}`
     const data = await readFile(os.homedir+"/reidun_data/store/user" + path)
    const result = imageType(data);

    return response.status(200).header('Content-type', result.mime).send(data)
  }
  async getUserBanner({request, params, auth, response}) {
    let path = `/${params.userid}/banners/${params.image}`
    const data = await readFile(os.homedir+"/reidun_data/store/user" + path)
    const result = imageType(data);

    return response.status(200).header('Content-type', result.mime).send(data)
  }
  async getPostFile({request, params, auth, response}) {
    let path = '/' + params.postid + '/' + params.file
    const data = await readFile(os.homedir+"/reidun_data/store/post" + path)
    const result = await FileType.fromBuffer(data);

    return response.status(200).header('Content-type', result.mime).header('Accept-Ranges','bytes').send(data)

  }




}


module.exports = MediaController
