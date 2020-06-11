'use strict';

const fs = use('fs')
const {validate} = use('Validator');
const FileUtil = require('../../util/FileUtil')
const moveFile = require('move-file');

const readChunk = require('read-chunk');
const imageType = require('image-type');
const os = require("os");

const User = use("App/Models/User");
const Role = use("App/Models/Role");
const UserRole = use("App/Models/UserRole")
const UserAvatar = use("App/Models/UserAvatar");
const UserBanner = use("App/Models/UserBanner");
const PrivacySetting = use("App/Models/PrivacySetting");
const PostImage = use("App/Models/Postimage");
const Blocklist = use("App/Models/blocklist")

const Logger = use('Logger')
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
    try {
      await user.save();

    } catch (err) {
      return response.status(500).json({
        status: "Error",
        message: 'could not save user'
      });
    }


    const setting = new PrivacySetting();
    setting.user_id = user.id;
    setting.profile_privacy = 'friends';
    setting.who_can_add = 'everyone';

    setting.save()

    try {
      setting.save()

    } catch (err) {
      return response.status(500).json({
        status: "Error",
        message: 'could not save settings'
      });
    }

    const userRole = await Role.findBy("slug", "user");

    await user.Roles().attach([userRole.id]);

    let avatarPath = `/${user.id}/avatars/${new Date().getTime()}.png`;
    let bannerPath = `/${user.id}/banners/${new Date().getTime()}.jpg`;

    fs.mkdirSync(`${os.homedir}/reidun_data/store/user/${user.id}`);
    fs.mkdirSync(`${os.homedir}/reidun_data/store/user/${user.id}/avatars`);
    fs.mkdirSync(`${os.homedir}/reidun_data/store/user/${user.id}/banners`);

    FileUtil.copy('./store/default/account.png', `${os.homedir}/reidun_data/store/user/${avatarPath}`, (err) => {
      if (err) return err;

    });
    FileUtil.copy('./store/default/banner.jpg', `${os.homedir}/reidun_data/store/user/${bannerPath}`, (err) => {
      if (err) return err;

    });
    const userBanner = new UserBanner();
    userBanner.user_id = user.id;
    userBanner.path = bannerPath;
    userBanner.isCurrentBanner = 1;
    await userBanner.save();
    const userAvatar = new UserAvatar();
    userAvatar.user_id = user.id;
    userAvatar.path = avatarPath;
    userAvatar.isCurrentAvatar = 1;
    userAvatar.save();

    return response.status(200).json({
      status: "Success",
      message: "The users was successfully created."
    });
  }

  async updateAndRequirePass({request, auth, response}) {
    const user = await User.find(auth.user.id);
    const input = request.all();
    if (!user || !this.comparePassword(input.passCheck, auth.user.password)) {
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

    body.first_name = input.first_name;
    body.last_name = input.last_name;
    body.gender = input.gender;
    body.birthday = input.birthday;
    body.email = input.email;
    body.password = input.informationEdit === true ? user.password : input.password;

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
    user.gender = body.gender;
    user.birthday = body.birthday;
    user.password = body.password;

    await user.save();

    return response.status(200).json({
      status: "Success",
      message: "The users was successfully updated."
    });
  }

  async update({request, auth, response}) {
    const user = await User.find(auth.user.id);
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
    user.gender = body.gender;
    user.birthday = body.birthday;
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
      .where("users.id", params.id).first()
    const userAvatar = await UserAvatar.query().where('user_id', db_user.id).where('isCurrentAvatar', 1).first()
    const userBanner = await UserBanner.query().where('user_id', db_user.id).where('isCurrentBanner', 1).first()
    const privacySettings = await PrivacySetting.query().where('user_id', db_user.id).first()
    const user = JSON.parse(JSON.stringify(db_user));
    delete user.password;
    user.avatar = userAvatar;
    user.banner = userBanner;
    user.privacy = privacySettings;

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
    const userAvatar = await UserAvatar.query().where('user_id', db_user.id).where('isCurrentAvatar', 1).first()
    const userRoles = await UserRole.query().where('user_id', db_user.id).first()
    const Roles = await Role.query().where('id', userRoles.role_id).first()
    const Privacy = await PrivacySetting.query().where('user_id', db_user.id).first()
    const userBanner = await UserBanner.query().where('user_id', db_user.id).where('isCurrentBanner', 1).first()

    const user = JSON.parse(JSON.stringify(db_user));
    delete user.password
    user.avatar = JSON.parse(JSON.stringify(userAvatar));
    user.banner = JSON.parse(JSON.stringify(userBanner));
    user.privacy = JSON.parse(JSON.stringify(Privacy))
    user.roles = JSON.parse(JSON.stringify(userRoles))
    user.roles.role = JSON.parse(JSON.stringify(Roles))


    if (!user) {
      return response.status(404).json({
        status: "Error",
        message: "Could not get user."
      });
    }
    return response.status(200).json({
      status: "Success",
      message: "The users was successfully found.",
      data: user
    });
  }

  comparePassword(passCheck, hash) {

    return Hash.verify(passCheck, hash);

  }

  async search({request, auth, response}) {
    const {q} = request.only(['q'])
    if (q === '') {
      return response.status(400).json({
        status: "Error",
        message: "Missing query."
      });


    }
    const db_users = await User.query().where('firstname', 'LIKE', q + '%').fetch()
    const users = JSON.parse(JSON.stringify(db_users));
    for (let u of users) {
      const userAvatar = await UserAvatar.query().where('user_id', u.id).where('isCurrentAvatar', 1).first();
      u.avatar = userAvatar;
      delete u.password

    }
    if (!users) {
      return response.status(404).json({
        status: "Error",
        message: "Could not find the could not find any user"
      });
    }


    return response.status(200).json({
      status: "Success",
      data: users,
    });
  }

  async changeProfilePicture({request, auth, response}) {
    const {userid} = request.all();

    const profilePic = request.file('image', {
      types: ['image'],
      size: '2mb',
      extnames: ['png', 'jpg', 'jfif', 'gif']

    })


    if (!profilePic) {
      return response.status(400).json({
        status: "error",
        message: "no file!"
      });
    }

    await profilePic.move(os.homedir + "/reidun_data/uploads", {
      name: profilePic.fileName,
      overwrite: true
    })

    if (!profilePic.moved()) {
      return response.status(500).json({
        status: "error",
        message: profilePic.error().message
      });

    }
    const buffer = readChunk.sync(os.homedir + "/reidun_data/uploads/" + profilePic.fileName, 0, 12);
    const result = imageType(buffer);

    if (!result) {
      fs.unlink(os.homedir + '/reidun_data/uploads/' + profilePic.fileName, (err) => {
        if (err) {
          console.log(err)
        }
      })
      return response.status(400).json({
        message: "not an image"
      })
    }


    let path = `/${userid}/avatars/${new Date().getTime()}.` + profilePic.subtype;

    await moveFile(`${os.homedir}/reidun_data/uploads/${profilePic.fileName}`, `${os.homedir}/reidun_data/store/user/${path}`)
    try {
      await UserAvatar.query().where('user_id', userid).where('isCurrentAvatar', 1).update({'isCurrentAvatar': 0})
      const userAvatar = new UserAvatar();

      userAvatar.user_id = userid
      userAvatar.path = path
      userAvatar.isCurrentAvatar = 1;
      userAvatar.save();

    } catch (e) {
      const userAvatar = new UserAvatar();

      userAvatar.user_id = userid
      userAvatar.path = path
      userAvatar.isCurrentAvatar = 1;
      userAvatar.save();
    }


    return response.status(200).json({
      status: "Success",
      message: 'updated profile picture!'
    });
  }

  async changeProfileBanner({request, auth, response}) {
    const {userid} = request.all();

    const profileBanner = request.file('image', {
      types: ['image'],
      size: '2mb',
      extnames: ['png', 'jpg', 'jfif']

    })


    if (!profileBanner) {
      return response.status(400).json({
        status: "error",
        message: "no file!"
      });
    }

    await profileBanner.move(os.homedir + "/reidun_data/uploads", {
      name: profileBanner.fileName,
      overwrite: true
    })

    if (!profileBanner.moved()) {
      return response.status(500).json({
        status: "error",
        message: profileBanner.error().message
      });

    }
    const buffer = readChunk.sync(os.homedir + "/reidun_data/uploads/" + profileBanner.fileName, 0, 12);
    const result = imageType(buffer);
    if (!result) {
      fs.unlink(os.homedir + '/reidun_data/uploads/' + profileBanner.fileName, (err) => {
        if (err) {
          console.log(err)
        }
      })
      return response.status(400).json({
        message: "not an image"
      })
    }


    let path = `/${userid}/banners/${new Date().getTime()}.` + profileBanner.subtype;

    await moveFile(`${os.homedir}/reidun_data/uploads/${profileBanner.fileName}`, `${os.homedir}/reidun_data/store/user/${path}`)

    try {
      await UserBanner.query().where('user_id', userid).where('isCurrentBanner', 1).update({'isCurrentBanner': 0})
      const userBanner = new UserBanner();

      userBanner.user_id = userid
      userBanner.path = path
      userBanner.isCurrentBanner = 1;
      userBanner.save();

    } catch (e) {
      const userBanner = new userBanner();

      userBanner.user_id = userid
      userBanner.path = path
      userBanner.isCurrentBanner = 1;
      userBanner.save();
    }


    return response.status(200).json({
      status: "Success",
      message: 'updated banner!'
    });
  }

  async getAllAvatars({request, auth, params, response}) {

    const userAvatars = await UserAvatar.query().where('user_id', params.userid).fetch()

    if (!userAvatars) {
      return response.status(404).json({
        error: "not found"
      })
    }

    return response.status(200).json({
      success: 'success',
      avatars: userAvatars

    })

  }

  async getAllBanners({request, auth, params, response}) {

    const userBanners = await UserBanner.query().where('user_id', params.userid).fetch()

    if (!userBanners) {
      return response.status(404).json({
        error: "not found"
      })
    }

    return response.status(200).json({
      success: 'success',
      data: userBanners

    })
  }

  async deleteBanner({request, auth, params, response}) {
    const body = request.all()

    const userBanner = await UserBanner.query().where('id', body.bannerId).where('user_id', auth.user.id).first()
    if (!userBanner) {
      return response.status(400).json({
        status: 'error',
        message: "could not find banner or already deleted"

      })
    }
    try {

      fs.unlink(`${os.homedir}/reidun_data/store/user/${userBanner.path}`, (err) => {
        if (err) throw err
      })

      await UserBanner.query().where('id', body.bannerId).where('user_id', auth.user.id).delete()

      return response.status(200).json({
        status: 'success',
        message: "deleted banner"

      })
    } catch (err) {

      Logger.error(err)
      Logger.transport('file').error(err)

      return response.status(500).json({
        status: 'error',
        message: "could not delete image file or already deleted"

      })
    }


  }

  async deleteAvatar({request, auth, params, response}) {
    const body = request.all()
    const userAvatar = await UserAvatar.query().where('id', body.avatarId).where('user_id', auth.user.id).first()
    if (!userAvatar) {
      return response.status(400).json({
        status: 'error',
        message: "could not find avatar or already deleted"

      })
    }
    try {
      await fs.unlink(`${os.homedir}/reidun_data/store/user/${userAvatar.path}`, async (err) => {
        if (err) throw err
      })
      await UserAvatar.query().where('id', body.avatarId).where('user_id', auth.user.id).delete()
      return response.status(200).json({
        success: 'success',
        message: "deleted avatar"

      })
    } catch (err) {
      Logger.error(err)
      Logger.transport('file').error(err)
      return response.status(500).json({
        success: 'success',
        message: "could not delete avatar or already deleted"

      })
    }
  }

  async changeProfilePrivacy({request, auth, params, response}) {
    const body = request.only(["privacy_setting"])
    try {
      await PrivacySetting.query().where('user_id', auth.user.id).update({profile_privacy: body.privacy_setting})
      return response.status(200).json({
        success: 'success',
        message: 'Changed'

      })
    } catch (e) {

      return response.status(404).json({
        error: "not found"
      })
    }
  }

  async changeFriendRequestPrivacy({request, auth, params, response}) {
    const body = request.only(["privacy_setting"])

    try {
      await PrivacySetting.query().where('user_id', auth.user.id).update({who_can_add: body.privacy_setting})
      return response.status(200).json({
        success: 'success',
        message: 'Changed'

      })
    } catch (e) {

      return response.status(500).json({
        error: e.message
      })
    }
  }

  async blockUser({request, auth, params, response}) {
    const body = request.all()
    try {
      const blockList = new Blocklist()
      blockList.blocker_id = auth.user.id
      blockList.blocked_user_id = body.targetUserId
      blockList.save()
      return response.status(200).json({
        status: 'success',
        message: "User blocked"
      })

    } catch (err) {
      Logger.error(err)
      return response.status(500).json({
        status: 'internal error',
        message: "Internal error occurred! Could not block user!"
      })
    }


  }


}

module.exports = UserController;
