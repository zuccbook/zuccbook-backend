'use strict';

const fs = use('fs')
const {validate} = use('Validator');
const FileUtil = require('../../util/FileUtil')
const moveFile = require('move-file');

const User = use("App/Models/User");
const Role = use("App/Models/Role");
const UserRole = use("App/Models/UserRole")
const UserAvatar = use("App/Models/UserAvatar");
const PrivacySetting = use("App/Models/PrivacySetting");
const Helpers = use('Helpers')

const Hash = use('Hash');

class UserController {
  async register({request, response}) {

    const rules = {
      firstname: "required",
      lastname: "required",
      gender: "required",
      birthday: "required",
      email: "required|email|unique:users,email",
      password: "required"
    };

    const body = request.only(["firstname", "lastname", "email", "gender", "birthday", "password"]);

    // Validate input.
    const validation = await validate(body, rules);

    if (validation.fails()) {
      return response.status(400).json({
        status: "Error",
        message: validation.messages()
      });
    }

    const user = new User();

    user.firstname = body.firstname;
    user.lastname = body.lastname;
    user.email = body.email;
    user.gender = body.gender;
    user.birthday = body.birthday;
    user.password = body.password;

    await user.save();


    const setting = new PrivacySetting();
    setting.user_id = user.id;
    setting.profile_privacy = 'friends';
    setting.who_can_add = 'everyone';

    setting.save()

    const userRole = await Role.findBy("slug", "user");

    await user.Roles().attach([userRole.id]);

    fs.mkdirSync("./store/users/"+user.id);

    let path = "/"+user.id+"/"+`/${new Date().getTime()}.png`;
    FileUtil.copy('./store/default/account.png', "./store/users"+path, (err) => {
      if (err) return err;

    });

    const userAvatar = new UserAvatar();
    userAvatar.user_id = user.id;
    userAvatar.path = path;
    userAvatar.isCurrentAvatar = 1;
    userAvatar.save();

    return response.status(200).json({
      status: "Success",
      message: "The users was successfully created."
    });
  }

  async update({request, auth, response}) {

    const user = await User.find(request.only("id").id);
    if (!user) {
      return response.status(400).json({
        status: "Error",
        message: "Request was malformed"
      });
    }

    const rules = {
      first_name: "required",
      last_name: "required",
      email: "required|email",
      password: "required"
    };

    const body = {};

    body.first_name = request.input("first_name", user.firstname);
    body.last_name = request.input("last_name", user.lastname);
    body.gender = request.input("gender", user.gender);
    body.birthday = request.input("birthday", user.birthday);
    body.email = request.input("email", user.email);
    body.password = request.input("password", user.password);

    const validation = await validate(body, rules);

    if (validation.fails()) {
      return response.status(400).json({
        status: "Error",
        message: validation.messages()
      });
    }

    user.firstname = body.first_name;
    user.lastname = body.last_name;
    user.email = body.email;
    user.gender = body.gender
    user.birthday = body.birthday
    user.password = body.password;

    await user.save();

    return response.status(200).json({
      status: "Success",
      message: "The users was successfully updated."
    });
  }

  async delete({request, auth, response}) {
    const user = await User.find(request.only("id").id);

    if (!user) {
      return response.status(400).json({
        status: "Error",
        message: "Request was malformed"
      });
    }

    await user.delete();

    return response.status(200).json({
      status: "Success",
      message: "The users was successfully deleted."
    });
  }

  async getOne({request, params, auth, response}) {
    const db_user = await User.query()
      .where("users.id",params.id).first()
    const userAvatar = await UserAvatar.query().where('user_id', db_user.id).where('isCurrentAvatar',1).first()
    const privacySettings = await PrivacySetting.query().where('user_id', db_user.id).first()
    const user = JSON.parse(JSON.stringify(db_user));
    user.avatar = userAvatar;
    user.privacy = privacySettings;
    console.log(user)

    if (!user) {
      return response.status(404).json({
        status: "Error",
        message: "Could not find the specified user."
      });
    }

    return response.status(200).json({
      status: "Success",
      message: "The users was successfully found.",
      data: user
    });
  }

  async getAll({request, params, auth, response}) {
    const users = await User.query().paginate(request.input("page", 1), request.input("limit", 20));

    if (!users) {
      return response.status(404).json({
        status: "Error",
        message: "Could not get users"
      });
    }

    return response.status(200).json({
      status: "Success",
      message: "The users was successfully found.",
      data: users
    });
  }

  async login({request, auth, response}) {
    const rules = {
      email: "required|email",
      password: "required"
    };

    const body = request.only(["email", "password"]);

    const validation = await validate(body, rules);

    if (validation.fails()) {
      return response.status(400).json({
        status: "Error",
        message: validation.messages()
      });
    }

    const jwt = await auth.attempt(body.email, body.password);

    if (!jwt) {
      return response.status(500).json({
        status: "Error",
        message: "Unknown error"
      });
    }

    return response.status(200).json({
      status: "Success",
      message: "You have been successfully logged in.",
      data: jwt
    });
  }

  async getSelf({request, auth, response}) {
    const id = auth.user.id


    const db_user = await User.query().where("id", id).first()
    const userAvatar = await UserAvatar.query().where('user_id', db_user.id).where('isCurrentAvatar',1).first()
    const userRoles = await UserRole.query().where('user_id', db_user.id).first()
    const Roles = await Role.query().where('id',userRoles.role_id).first()
    const user = JSON.parse(JSON.stringify(db_user));
    user.avatar =  JSON.parse(JSON.stringify(userAvatar));
    user.roles  = JSON.parse(JSON.stringify(userRoles))
    user.roles.role  = JSON.parse(JSON.stringify(Roles))



    if (!user) {
      return response.status(404).json({
        status: "Error",
        message: "Could not find get user."
      });
    }
    return response.status(200).json({
      status: "Success",
      message: "The users was successfully found.",
      data: user
    });
  }

  async comparePassword({request, auth, response}) {
    const isSame = await Hash.verify(request.input("password"), request.input("hash"));
    if (isSame) {
      return response.status(200).json({
        status: "Success",
        message: "The passwords match."
      })
    } else {
      return response.status(401).json({
        status: "Error",
        message: "No match"
      })
    }
  }

  async search({request, auth, response}) {
    const {q} = request.only(['q'])
    if(q === ''){
      return response.status(400).json({
        status: "Error",
        message: "Missing query."
      });


    }
    const db_user = await User.query().where('firstname', 'LIKE', q+'%')
     .fetch()
    const userAvatar = UserAvatar.query().where('user_id', db_user.id).where('isCurrentAvatar',1)
    const user = JSON.parse(JSON.stringify(db_user));;
    user.avatar = userAvatar;
    console.log(user)

    if (!user) {
      return response.status(404).json({
        status: "Error",
        message: "Could not find the could not find any user"
      });
    }

    return response.status(200).json({
      status: "Success",
      data: user
    });
  }
  async changeProfilePicture({request, auth, response}) {
    const { userid } = request.all();

    const profilePic = request.file('image', {
      types: ['image'],
      size: '2mb',
      extnames: ['png','jpg', 'jfif', 'gif']

    })

    if(!profilePic){
      return response.status(400).json({
        status: "error",
        message: "no file!"
      });
    }

    await profilePic.move(Helpers.tmpPath('uploads'), {
      name: profilePic.fileName,
      overwrite: true
    })


    if (!profilePic.moved()) {
      return response.status(500).json({
        status: "error",
        message: profilePic.error()
      });

    }
    let path = userid+"/"+`${new Date().getTime()}.`+profilePic.subtype;


    await moveFile("./tmp/uploads/"+profilePic.fileName, "./store/user/"+path)

    await UserAvatar.query().where('user_id', userid).where('isCurrentAvatar', 1).update({'isCurrentAvatar': 0})


    const userAvatar = new UserAvatar();

    userAvatar.user_id = userid
    userAvatar.path = path
    userAvatar.isCurrentAvatar = 1;
    userAvatar.save();

    return response.status(200).json({
      status: "Success",
      message: 'updated profile picture!'
    });
  }
  async getAllAvatars({request, auth, params, response}) {

    const userAvatars = await UserAvatar.query().where('user_id', params.userid).fetch()

    if(!userAvatars){
      return response.status(404).json({
         error:"not found"
      })
    }

    return response.status(200).json({
      success: 'success',
      avatars: userAvatars

    })

  }

}

module.exports = UserController;
