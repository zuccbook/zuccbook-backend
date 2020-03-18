'use strict'
const User = use("App/Models/User");
const UserAvatar = use("App/Models/UserAvatar");
const Post = use("App/Models/Post");
const Postlike = use("App/Models/Postlike")
const Postdislike = use("App/Models/Postdislike")
const PostComment = use("App/Models/Comment")
const PostImage = use("App/Models/Postimage");
const Relationship = use("App/Models/Relationship")

const Helpers = use('Helpers')
const {validate} = use('Validator');

const moveFile = require('move-file');
const readChunk = require('read-chunk');
const imageType = require('image-type');
const fs = use('fs')

class PostController {

  async createPost({request, params, auth, response}) {
    let str = request.header('content-type')
    str.trim()
    let contentType = str.split(';')
    if (contentType[0] === "multipart/form-data") {
      const {poster, text, create_time} = request.all();

      let files = ['file_0', 'file_1', "file_2", "file_3"]
      let uploadFiles = []
      let storeFiles = []

      for (let file of files) {
        try {
          let postFile = request.file(file, {
            types: ['image','video'],
            size: '5mb',
            extnames: ['png', 'jpg', 'jfif', 'gif','mp4']

          });
          if (postFile) {
            uploadFiles.push(postFile)
          }
        }catch (e) {

        }


      }
      for (let file of uploadFiles) {
        if (file != null) {
          await file.move(Helpers.tmpPath('uploads'), {
            name: file.fileName,
            overwrite: true
          })
        }
        if (!file.moved()) {
          return response.status(500).json({
            status: "error",
            message: file.error()
          });
        }
      }



      const post = new Post()
      post.text = text
      post.dateposted = create_time
      post.poster_id = poster
      await post.save()

      fs.mkdirSync("./store/post/" + post.id);

      for (let file of uploadFiles) {
        let path = post.id + "/" + `${new Date().getTime()}.` + file.subtype;
        storeFiles.push(path)

        await moveFile("./tmp/uploads/" + file.fileName, "./store/post/" + path)
      }

      for (let storeFile of storeFiles) {
        const postImage = new PostImage()
        postImage.path = storeFile
        postImage.post_id = post.id
        await postImage.save()
      }
      return response.status(200).json({
        status: 'success',
        message: 'Successfully created post'
      })

    } else if (contentType[0] === "application/x-www-form-urlencoded" || contentType[0] === 'application/json') {
      const rules = {
        poster: "required",
        create_time: "required",
        text: "required",
      };

      const body = request.only(['poster', 'create_time', 'text'])
      const validation = await validate(body, rules);

      if (validation.fails()) {
        return response.status(400).json({
          status: "Error",
          message: validation.messages()
        });
      }
      const post = new Post()
      post.text = body.text
      post.dateposted = body.create_time
      post.poster_id = body.poster

      await post.save()

      return response.status(200).json({
        status: 'success',
        message: 'Successfully created post'
      })


    }


  }

  async deletePost({request, params, auth, response}) {

  }

  async likePost({request, params, auth, response}) {

  }

  async dislikePost({request, params, auth, response}) {

  }

  async getComments({request,params,auth,response}){
    if(params.postId === undefined || params.postId === ''){
      return response.status(400).json({
        status:'error',
        message:'cannot be empty'
      })
    }
    const comments = await PostComment.query().where("post_id", params.postId).orderBy('dateposted', 'desc').fetch()
    if(!comments){
      return response.status(404).json({
        status:'error',
        message:'no comments'
      })
    }
    const responeComments = JSON.parse(JSON.stringify(comments))
    for(let comment of responeComments){
      let user  = await User.query().where('id', comment.users_id).first()
      let userAvatar = await UserAvatar.query().where('user_id',user.id).where('isCurrentAvatar',1).first()
      comment.user = JSON.parse(JSON.stringify(user))
      comment.user.avatar = JSON.parse(JSON.stringify(userAvatar))
    }
    return response.status(200).json({
      status:'success',
      data: responeComments
    })
  }

  async commentPost({request, params, auth, response}) {

    const body = request.only(['postId','commentContent','userId', 'datePosted'])
    const comment = new PostComment()
    comment.post_id =  body.postId
    comment.comment_content =  body.commentContent
    comment.users_id = body.userId
    comment.dateposted = body.datePosted
    comment.save();

    return response.status(200).json({
      status:'success',
      message:'comment successfully created'
    })

  }
  async getPosts({request, params, auth, response}){

    let posts;
    const friends = await Relationship.query().where("status", 1).where("user_id_1", auth.user.id).orWhere("user_id_2", auth.user.id).fetch()
    const data = JSON.parse(JSON.stringify(friends))
    if (data.length !== 0){
      for (let friend of data) {
        if(friend.user_id_1 === auth.user.id){
          posts = await Post.query().where("poster_id", friend.user_id_2).orWhere('poster_id',auth.user.id).orderBy('dateposted', 'desc').fetch();
        }else if(friend.user_id_2 === auth.user.id){
          posts = await Post.query().where("poster_id", friend.user_id_1).orWhere('poster_id',auth.user.id).orderBy('dateposted', 'desc').fetch();

        }
      }
        const responsePosts = JSON.parse(JSON.stringify(posts))
        for(let post of responsePosts) {
          const user = await User.query().where('id',post.poster_id).first()
          const userAvatar = await UserAvatar.query().where('user_id',post.poster_id).where('isCurrentAvatar',1).first()
          post.poster = JSON.parse(JSON.stringify(user))
          delete post.poster.password
          post.poster.avatar = JSON.parse(JSON.stringify(userAvatar))
          const postImage = await PostImage.query().where('post_id',post.id).fetch()
          post.post_files = JSON.parse(JSON.stringify(postImage))

          const postlikes = await Postlike.query("post_id", post.id).fetch()
           let likes = JSON.parse(JSON.stringify(postlikes))
          if (!postlikes) {
            for (let like of likes) {
              const user = await User.query().where("id", like.user_id).first()
              likes.user = JSON.parse(JSON.stringify(user))
            }
          }else{
            likes = []
          }
          const postdislikes = await Postdislike.query("post_id", post.id).fetch()
          let dislikes = JSON.parse(JSON.stringify(postdislikes))
          if (!postdislikes) {
            for (let dislike of dislikes) {
              const user = await User.query().where("id", dislike.user_id).first()
              dislike.user = JSON.parse(JSON.stringify(user))
            }
          }else{
            dislikes = []
          }
          const PostComments = await PostComment.query("post_id", post.id).fetch()
          let comments = JSON.parse(JSON.stringify(PostComments))
          if (!PostComments) {
            for (let comment of comments) {
              const user = await User.query().where("id", comment.user_id).first()
              comment.user = JSON.parse(JSON.stringify(user))
            }
          }else{
            comments = []
          }
          post.likes = likes
          post.dislikes = postlikes
          post.comments = comments

        }
        return response.status(200).json({
          status: 200,
          data:responsePosts
        })

    }else{
      posts = await Post.query().orWhere('poster_id', auth.user.id).orderBy('dateposted', 'desc').fetch();
      const responsePosts = JSON.parse(JSON.stringify(posts))
      for(let post of responsePosts) {
        const user = await User.query().where('id',post.poster_id).first()
        const userAvatar = await UserAvatar.query().where('user_id',post.poster_id).where('isCurrentAvatar',1).first()
        post.poster = JSON.parse(JSON.stringify(user))
        post.poster.avatar = JSON.parse(JSON.stringify(userAvatar))
        delete post.poster.password
        const postImage = await PostImage.query().where('post_id',post.id).fetch()
        post.post_files = JSON.parse(JSON.stringify(postImage))
        const postlikes = await Postlike.query("post_id", post.id).fetch()
        let likes = JSON.parse(JSON.stringify(postlikes))
        if (!postlikes) {
          for (let like of likes) {
            const user = await User.query().where("id", like.user_id).first()
            likes.user = JSON.parse(JSON.stringify(user))
          }
        }else{
          likes = []
        }
        const postdislikes = await Postdislike.query("post_id", post.id).fetch()
        let dislikes = JSON.parse(JSON.stringify(postdislikes))
        if (!postdislikes) {
          for (let dislike of dislikes) {
            const user = await User.query().where("id", dislike.user_id).first()
            dislike.user = JSON.parse(JSON.stringify(user))
          }
        }else{
          dislikes = []
        }
        const PostComments = await PostComment.query("post_id", post.id).fetch()
        let comments = JSON.parse(JSON.stringify(PostComments))
        if (!PostComments) {
          for (let comment of comments) {
            const user = await User.query().where("id", comment.user_id).first()
            comment.user = JSON.parse(JSON.stringify(user))
          }
        }else{
          comments = []
        }
        post.likes = likes
        post.dislikes = postlikes
        post.comments = comments

      }
      return response.status(200).json({
        status: 200,
        data:responsePosts
      })

    }
  }

  async getPost({request, params, auth, response}){
    const {id} = request.only(['id'])
    if (id === '') {
      return response.status(400).json({
        status: "Error",
        message: "Missing id parameter."
      });
    }
      let post;
      post = await Post.query().where('id', id).first();
      const responsePost = JSON.parse(JSON.stringify(post))
      const user = await User.query().where('id',post.poster_id).first()
      const userAvatar = await UserAvatar.query().where('user_id',post.poster_id).where('isCurrentAvatar',1).first()
      responsePost.poster = JSON.parse(JSON.stringify(user))
      responsePost.poster.avatar = JSON.parse(JSON.stringify(userAvatar))
        delete responsePost.poster.password
        const postImage = await PostImage.query().where('post_id',post.id).fetch()
      responsePost.post_files = JSON.parse(JSON.stringify(postImage))
        const postlikes = await Postlike.query("post_id", post.id).fetch()
        let likes = JSON.parse(JSON.stringify(postlikes))
        if (!postlikes) {
          for (let like of likes) {
            const user = await User.query().where("id", like.user_id).first()
            likes.user = JSON.parse(JSON.stringify(user))
          }
        }else{
          likes = []
        }
        const postdislikes = await Postdislike.query("post_id", post.id).fetch()
        let dislikes = JSON.parse(JSON.stringify(postdislikes))
        if (!postdislikes) {
          for (let dislike of dislikes) {
            const user = await User.query().where("id", dislike.user_id).first()
            dislike.user = JSON.parse(JSON.stringify(user))
          }
        }else{
          dislikes = []
        }
        const PostComments = await PostComment.query("post_id", post.id).fetch()
        let comments = JSON.parse(JSON.stringify(PostComments))
        if (!PostComments) {
          for (let comment of comments) {
            const user = await User.query().where("id", comment.user_id).first()
            comment.user = JSON.parse(JSON.stringify(user))
          }
        }else{
          comments = []
        }
      responsePost.likes = likes
      responsePost.dislikes = postlikes
      responsePost.comments = comments

      return response.status(200).json({
        status: 200,
        data:responsePost
      })

    }

}

module.exports = PostController
