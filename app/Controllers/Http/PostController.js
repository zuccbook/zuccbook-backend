'use strict'

class PostController {
  async createPostWithImages() {

  }
  async createPostWithoutImages() {

  }

  async createPost({request, params, auth, response}) {
    let contentType  = request.header('content-type')



    if(contentType === "multipart/form-data"){
      response.body
      this.createPostWithImages()
    }else if(contentType === "application/x-www-form-urlencoded" || contentType === 'application/json'){

      this.createPostWithoutImages()

    }


  }
  async deletePost({request, params, auth, response}) {

  }
  async likePost({request, params, auth, response}) {

  }
  async dislikePost({request, params, auth, response}) {

  }
  async commentPost({request, params, auth, response}) {

  }



}

module.exports = PostController
