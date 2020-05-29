'use strict'
const User = use("App/Models/User");
const UserAvatar = use("App/Models/UserAvatar");
const Post = use("App/Models/Post");
const Postlike = use("App/Models/Postlike")
const Postdislike = use("App/Models/Postdislike")
const PostComment = use("App/Models/Comment")
const PostImage = use("App/Models/Postimage");
const Relationship = use("App/Models/Relationship")
const Notification = use("App/Models/Notification")


const Helpers = use('Helpers')
const {validate} = use('Validator');

const moveFile = require('move-file');
const readChunk = require('read-chunk');
const imageType = require('image-type');
const os = require("os");
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
            types: ['image', 'video'],
            size: '5mb',
            extnames: ['png', 'jpg', 'jfif', 'gif', 'mp4']

          });
          if (postFile) {
            uploadFiles.push(postFile)
          }
        } catch (e) {

        }


      }
      for (let file of uploadFiles) {
        if (file != null) {
          await file.move(os.homedir+"/reidun_data/uploads", {
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

      fs.mkdirSync(os.homedir+"/reidun_data/store/post/" + post.id);

      for (let file of uploadFiles) {
        let path = post.id + "/" + `${new Date().getTime()}.` + file.subtype;
        storeFiles.push(path)

        await moveFile(os.homedir+"/reidun_data/uploads/" + file.fileName, os.homedir+"/reidun_data/store/post/" + path)
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
    const body = request.only(['postId'])
    if (!body) {
      return response.status(400).json({
        status: 'bad request',
        message: "Body can't be empty!"
      })

    }
    try {

      const postDislikes = await Postdislike.query().where('post_id', body.postId).fetch()
      const dislikes = JSON.parse(JSON.stringify(postDislikes))
      if (Postdislike.length !== 0) {
        for (let dislike of dislikes) {
          await Postdislike.query().where('id', dislike.id).where('poster_id',auth.user.id).delete()
        }
      }
      const postLikes = await Postlike.query().where('post_id', body.postId).fetch()
      const likes = JSON.parse(JSON.stringify(postLikes))
      if (Postlike.length !== 0) {
        for (let like of likes) {
          await Postlike.query().where('id', likes.id).delete()
        }
      }
      const postFiles = await PostImage.query().where('post_id', body.postId).fetch()
      const files = JSON.parse(JSON.stringify(postFiles))
      if (postFiles.length !== 0) {
        for (let file of files) {
          fs.unlink('./store/post/' + file.path, (err) => {
            if (err) {
              return err
              console.log(err)
            }
          })
          await PostImage.query().where('id', file.id).delete()
        }
      }
      const postComments = await PostComment.query().where('post_id', body.postId).fetch()
      const Comments = JSON.parse(JSON.stringify(postComments))
      if (Comments.length !== 0) {
        for (let comment of Comments) {
          await PostComment.query().where('id', comment.id).delete()
        }
      }

      await Post.query().where('id', body.postId).delete()
      return response.status(200).json({
        status: 'success',
        message: 'post successfully deleted!'
      })

    } catch (e) {
      console.log(e)
      return response.status(500).json({
        status: 'error',
        message: "Something bad happened, couldn't delete post"
      })
    }

  }

  async likePost({request, params, auth, response}) {
    const body = request.only(['postId', 'userId','senderId'])
    if(!body){
      return response.status(400).json({
        status: 'error',
        message: 'body empty'
      })
    }
    try {
      const likePost = new Postlike()
      likePost.user_id = body.senderId
      likePost.post_id = body.postId
      await likePost.save()
      if(body.userId !== auth.user.id){
       const notification = new Notification()
       notification.type = 'POST_LIKED'
       notification.target_id = body.userId
       notification.sender_id = body.senderId

       await notification.save();
     }

      return response.status(200).json({
        status: 'success',
        message: 'liked post'
      })

    } catch (e) {
      console.log(e)
      return response.status(500).json({
        status: 'error',
        message: 'Error happened'
      })

    }

  }
  async unlikePost({request, params, auth, response}) {
    const body = request.only(['userId','postId'])
    if(!body){
      return response.status(400).json({
        status: 'error',
        message: 'body is empty'
      })
    }
    try{

      await Postlike.query().where('user_id',body.userId).where('post_id',body.postId).delete()

    }catch (e) {
      console.log(e)
      return response.status(500).json({
        status: 'error',
        message: 'error happened'
      })
    }

  }

  async dislikePost({request, params, auth, response}) {
    const body = request.only(['postId', 'userId','senderId'])
    try {
      const dislikePost = new Postdislike()
      dislikePost.user_id = body.senderId
      dislikePost.post_id = body.postId
      await dislikePost.save()
      if(body.senderId !== auth.user.id){
        const notification = new Notification()
        notification.type = 'POST_DISLIKED'
        notification.target_id = body.userId
        notification.sender_id = body.senderId
        await notification.save();

      }
      return response.status(200).json({
        status: 'success',
        message: 'liked post'
      })

    } catch (e) {
      return response.status(500).json({
        status: 'error',
        message: 'Error happened'
      })

    }
  }

  async undislikePost({request, params, auth, response}) {
    const body = request.only(['userId','postId'])
    if(!body){
      return response.status(400).json({
        status: 'error',
        message: 'body is empty'
      })
    }
    try{

      await Postdislike.query().where('user_id',body.userId).where('post_id',body.postId).delete()

    }catch (e) {
      console.log(e)
      return response.status(500).json({
        status: 'error',
        message: 'error happened'
      })
    }

  }

  async getComments({request, params, auth, response}) {

    if (params.postId === undefined || params.postId === '') {
      return response.status(400).json({
        status: 'error',
        message: 'cannot be empty'
      })
    }
    const comments = await PostComment.query().where("post_id", params.postId).orderBy('dateposted', 'desc').fetch()
    if (!comments) {
      return response.status(404).json({
        status: 'error',
        message: 'no comments'
      })
    }
    const responseComments = JSON.parse(JSON.stringify(comments))

    for (let comment of responseComments) {
      let user = await User.query().where('id', comment.users_id).first()
      let userAvatar = await UserAvatar.query().where('user_id', user.id).where('isCurrentAvatar', 1).first()
      comment.user = JSON.parse(JSON.stringify(user))
      comment.user.avatar = JSON.parse(JSON.stringify(userAvatar))
    }
    return response.status(200).json({
      status: 'success',
      data: responseComments
    })
  }

  async commentPost({request, params, auth, response}) {
    const rules = {
      postId: "required",
      commentContent: "required",
      userId: "required",
      datePosted: "required",
    };

    const body = request.only(['postId', 'commentContent', 'userId', 'datePosted'])

    const validation = await validate(body, rules);

    if (validation.fails()) {
      return response.status(400).json({
        status: "Error",
        message: validation.messages()
      });
    }
    try {
      const comment = new PostComment();
      comment.post_id = body.postId
      comment.comment_content = body.commentContent
      comment.users_id = body.userId
      comment.dateposted = body.datePosted
      comment.save();
    } catch (e) {
      return response.status(500).json({
        status: "Error",
        message: e.message
      });
    }

    return response.status(200).json({
      status: 'success',
      message: 'comment successfully created'
    })
  }
  async updateComment({request, params, auth, response}) {
    const body = request.only(['newText', 'commentId'])
    if(!body){
      return response.status(400).json({
        status:"error",
        message:"Body is malformed"
      })
    }
    try {
      await PostComment.query().where("id", body.commentId).where("users_id",auth.user.id).update({comment_content:body.newText})
      return response.status(200).json({
        status:"error",
        message:"Post text successfully changed!"
      })
    } catch (e) {
      console.log(e)
      return response.status(500).json({
        status:"error",
        message:"Internal server error"
      })
    }
  }
  async deleteComment({request, params, auth, response}){
    const body = request.only(['commentId'])
    try{
    await PostComment.query().where('id', body.commentId).where("users_id",auth.user.id).delete()

    return response.status(200).json({
      status:"error",
      message:"Post text successfully changed!"
    })
  } catch (e) {
    return response.status(500).json({
      status:"error",
      message:"Internal server error"
    })
  }
  }

  async getPostsFromSpecificUser({request, params, auth, response}) {
    if (params.id === undefined && params.id === '') {
      return response.status(400).json({
        status: 400,
        message: 'param is empty or is not set'
      })
    }
    const posts = await Post.query().orWhere('poster_id', params.id).orderBy('dateposted', 'desc').fetch();
    const responsePosts = JSON.parse(JSON.stringify(posts))
    for (let post of responsePosts) {
      const user = await User.query().where('id', post.poster_id).first()
      const userAvatar = await UserAvatar.query().where('user_id', post.poster_id).where('isCurrentAvatar', 1).first()
      post.poster = JSON.parse(JSON.stringify(user))
      post.poster.avatar = JSON.parse(JSON.stringify(userAvatar))
      delete post.poster.password
      const postImage = await PostImage.query().where('post_id', post.id).fetch()
      post.post_files = JSON.parse(JSON.stringify(postImage))

      const postlikes = await Postlike.query().where("post_id", post.id).fetch()
      let likes = JSON.parse(JSON.stringify(postlikes))
      if (likes.length !== 0) {
        for (let like of likes) {
          const user = await User.query().where("id", like.user_id).first()
          like.user = JSON.parse(JSON.stringify(user))
          delete like.user.password

        }
      } else {
        likes = []
      }
      const postdislikes = await Postdislike.query().where("post_id", post.id).fetch()
      let dislikes = JSON.parse(JSON.stringify(postdislikes))
      if (dislikes.length !== 0) {
        for (let dislike of dislikes) {
          const user = await User.query().where("id", dislike.user_id).first()
          dislike.user = JSON.parse(JSON.stringify(user))
          delete dislike.user.password
        }
      } else {
        dislikes = []
      }
      const PostComments = await PostComment.query().count("* as amount").where("post_id", post.id).first()
      let commentsAmount;
      if (PostComments !== 0) {
        commentsAmount = PostComments.amount
      } else {
        commentsAmount = 0
      }
      post.likes = likes
      post.dislikes = dislikes
      post.comments = commentsAmount

    }
    return response.status(200).json({
      status: 200,
      data: responsePosts
    })
  }

  async getPosts({request, params, auth, response}) {

    let posts;
    const friends = await Relationship.query().where("status", 1).whereRaw("(user_id_1 = ? OR user_id_2 = ?)", [auth.user.id, auth.user.id]).fetch()
    const data = JSON.parse(JSON.stringify(friends))
    if (data.length !== 0) {
      for (let friend of data) {
        if (friend.user_id_1 === auth.user.id) {
          posts = await Post.query().where("poster_id", friend.user_id_2).orWhere('poster_id', auth.user.id).orderBy('dateposted', 'desc').fetch();
        } else if (friend.user_id_2 === auth.user.id) {
          posts = await Post.query().where("poster_id", friend.user_id_1).orWhere('poster_id', auth.user.id).orderBy('dateposted', 'desc').fetch();

        }
      }
      const responsePosts = JSON.parse(JSON.stringify(posts))
      for (let post of responsePosts) {
        const user = await User.query().where('id', post.poster_id).first()
        const userAvatar = await UserAvatar.query().where('user_id', post.poster_id).where('isCurrentAvatar', 1).first()
        post.poster = JSON.parse(JSON.stringify(user))
        delete post.poster.password
        post.poster.avatar = JSON.parse(JSON.stringify(userAvatar))
        const postImage = await PostImage.query().where('post_id', post.id).fetch()
        post.post_files = JSON.parse(JSON.stringify(postImage))

        const postlikes = await Postlike.query().where("post_id", post.id).fetch()
        let likes = JSON.parse(JSON.stringify(postlikes))
        if (likes.length !== 0) {
          for (let like of likes) {
            const user = await User.query().where("id", like.user_id).first()
            like.user = JSON.parse(JSON.stringify(user))
            delete like.user.password

          }
        } else {
          likes = []
        }
        const postdislikes = await Postdislike.query().where("post_id", post.id).fetch()
        let dislikes = JSON.parse(JSON.stringify(postdislikes))
        if (dislikes.length !== 0) {
          for (let dislike of dislikes) {
            const user = await User.query().where("id", dislike.user_id).first()
            dislike.user = JSON.parse(JSON.stringify(user))
            delete dislike.user.password
          }
        } else {
          dislikes = []
        }
        const PostComments = await PostComment.query().count("* as amount").where("post_id", post.id).first()
        let commentsAmount;
        if (PostComments !== 0) {
          commentsAmount = PostComments.amount
        } else {
          commentsAmount = 0
        }
        post.likes = likes
        post.dislikes = dislikes
        post.comments = commentsAmount

      }
      return response.status(200).json({
        status: 200,
        data: responsePosts
      })

    } else {
      posts = await Post.query().orWhere('poster_id', auth.user.id).orderBy('dateposted', 'desc').fetch();
      const responsePosts = JSON.parse(JSON.stringify(posts))
      for (let post of responsePosts) {
        const user = await User.query().where('id', post.poster_id).first()
        const userAvatar = await UserAvatar.query().where('user_id', post.poster_id).where('isCurrentAvatar', 1).first()
        post.poster = JSON.parse(JSON.stringify(user))
        post.poster.avatar = JSON.parse(JSON.stringify(userAvatar))
        delete post.poster.password
        const postImage = await PostImage.query().where('post_id', post.id).fetch()
        post.post_files = JSON.parse(JSON.stringify(postImage))

        const postlikes = await Postlike.query().where("post_id", post.id).fetch()
        let likes = JSON.parse(JSON.stringify(postlikes))
        if (likes.length !== 0) {
          for (let like of likes) {
            const user = await User.query().where("id", like.user_id).first()
            like.user = JSON.parse(JSON.stringify(user))
            delete like.user.password

          }
        } else {
          likes = []
        }
        const postdislikes = await Postdislike.query().where("post_id", post.id).fetch()
        let dislikes = JSON.parse(JSON.stringify(postdislikes))
        if (dislikes.length !== 0) {
          for (let dislike of dislikes) {
            const user = await User.query().where("id", dislike.user_id).first()
            dislike.user = JSON.parse(JSON.stringify(user))
            delete dislike.user.password
          }
        } else {
          dislikes = []
        }
        const PostComments = await PostComment.query().count("* as amount").where("post_id", post.id).first()
        let commentsAmount;
        if (PostComments !== 0) {
          commentsAmount = PostComments.amount
        } else {
          commentsAmount = 0
        }
        post.likes = likes
        post.dislikes = dislikes
        post.comments = commentsAmount

      }
      return response.status(200).json({
        status: 200,
        data: responsePosts
      })

    }
  }

  async getPost({request, params, auth, response}) {
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
    const user = await User.query().where('id', post.poster_id).first()
    const userAvatar = await UserAvatar.query().where('user_id', post.poster_id).where('isCurrentAvatar', 1).first()
    responsePost.poster = JSON.parse(JSON.stringify(user))
    responsePost.poster.avatar = JSON.parse(JSON.stringify(userAvatar))
    delete responsePost.poster.password
    const postImage = await PostImage.query().where('post_id', post.id).fetch()
    responsePost.post_files = JSON.parse(JSON.stringify(postImage))
    const postlikes = await Postlike.query().where("post_id", post.id).fetch()
    let likes = JSON.parse(JSON.stringify(postlikes))
    if (likes.length !== 0) {
      for (let like of likes) {
        const user = await User.query().where("id", like.user_id).first()
        like.user = JSON.parse(JSON.stringify(user))
        delete like.user.password

      }
    } else {
      likes = []
    }
    const postdislikes = await Postdislike.query().where("post_id", post.id).fetch()
    let dislikes = JSON.parse(JSON.stringify(postdislikes))
    if (dislikes.length !== 0) {
      for (let dislike of dislikes) {
        const user = await User.query().where("id", dislike.user_id).first()
        dislike.user = JSON.parse(JSON.stringify(user))
        delete dislike.user.password
      }
    } else {
      dislikes = []
    }
    responsePost.likes = likes
    responsePost.dislikes = dislikes

    return response.status(200).json({
      status: 200,
      data: responsePost
    })

  }
  async getFilesPostedByUser({request, params, auth, response}){

    if(!params.id){
      return response.status(400).json({
        status: 'bad request',
        message: 'parameter is missing'
      })
    }
    try{
      const databasePosts = await Post.query().where('poster_id',params.id).fetch()
      const posts = JSON.parse(JSON.stringify(databasePosts))
      const Files = []

      for(let post of posts){
        const postFiles = await PostImage.query().where('post_id',post.id).fetch()
        const files = JSON.parse(JSON.stringify(postFiles))
        if(files.length !== 0){
          for(let file of files){
            Files.push(JSON.parse(JSON.stringify(file)))
          }

        }
      }
      if(Files.length === 0){
        return response.status(404).json({
          status: 'error',
          message: 'no files'
        })
      }
      return  response.status(200).json({
        status: 'success',
        data: Files
      })
    }catch (e) {
      return response.status(500).json({
        status: 'error',
        message: e.message
      })
    }
  }
  async updatePost({request, params, auth, response}){
    const body = request.only(['userId','newText', 'postId'])
    if(!body){
     return response.status(400).json({
        status:"error",
        message:"Body is malformed"
      })
    }
    try {
      await Post.query().where("id", body.postId).where("poster_id",body.userId).update({text:body.newText})
      return response.status(200).json({
        status:"error",
        message:"Post text successfully changed!"
      })
    } catch (e) {
      return response.status(500).json({
        status:"error",
        message:"Internal server error"
      })
    }
  }

}

module.exports = PostController
