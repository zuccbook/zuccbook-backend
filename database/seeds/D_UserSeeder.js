'use strict';

/*
|--------------------------------------------------------------------------
| D_UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');
const fs = require('fs')
const FileUtil = require('../../app/util/FileUtil')
const os = require("os");
const User = use("App/Models/User");
const Role = use("App/Models/Role");
const UserAvatar = use("App/Models/UserAvatar");
const UserBanner = use("App/Models/UserBanner");
const PrivacySetting = use("App/Models/PrivacySetting");



class D_UserSeeder {
  async run () {

    if(await User.findBy("email", "admin@localhost.local")) return;

    const user = new User();

    user.firstname = "admin";
    user.lastname = "admin"
    user.email = "admin@localhost.local";
    user.gender = "unspecified";
    user.birthday = "unspecified";
    user.password = "admin";

    await user.save();
    const findUser = await User.findBy("email", "admin@localhost.local");
    const adminRole = await Role.findBy("slug", "admin");

    const setting = new PrivacySetting();
    setting.user_id = findUser.id;
    setting.profile_privacy = 'friends';
    setting.who_can_add = 'everyone';
    await setting.save()


    await findUser.Roles().attach([adminRole.id]);

    const dirs = ['/reidun_data','/reidun_data/store/','/reidun_data/store/post','/reidun_data/store/user']
    let avatarPath = `/${user.id}/avatars/${new Date().getTime()}.png`;
    let bannerPath = `/${user.id}/banners/${new Date().getTime()}.jpg`;

    try {
      for (let dir of dirs) {
        if (!fs.existsSync(os.homedir + dir)) {
          fs.mkdirSync(os.homedir + dir)
        }
      }

      fs.mkdirSync(`${os.homedir}/reidun_data/store/user/${user.id}`);
      fs.mkdirSync(`${os.homedir}/reidun_data/store/user/${user.id}/avatars`);
      fs.mkdirSync(`${os.homedir}/reidun_data/store/user/${user.id}/banners`);

      FileUtil.copy('./store/default/account.png', `${os.homedir}/reidun_data/store/user/${avatarPath}`, (err) => {
        if (err) return err;

      });
      FileUtil.copy('./store/default/banner.jpg', `${os.homedir}/reidun_data/store/user/${bannerPath}`, (err) => {
        if (err) return err;

      });
    } catch (e) {
      console.log(e)
    }
    const userBanner = new UserBanner();
    userBanner.user_id = user.id;
    userBanner.path = bannerPath;
    userBanner.isCurrentBanner = 1;
    await userBanner.save();
    const userAvatar = new UserAvatar();
    userAvatar.user_id = user.id;
    userAvatar.path = avatarPath;
    userAvatar.isCurrentAvatar = 1;
    await userAvatar.save();
    console.log("made default user, it's recommended you change your password")

  }
}

module.exports = D_UserSeeder;
