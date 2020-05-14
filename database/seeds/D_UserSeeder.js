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
const User = use("App/Models/User");
const Role = use("App/Models/Role");
const UserAvatar = use("App/Models/UserAvatar");



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

    await findUser.Roles().attach([adminRole.id]);
    fs.mkdirSync("./store/user/" + user.id);

    let path = "/" + user.id + `/${new Date().getTime()}.png`;
    FileUtil.copy('./store/default/account.png', "./store/user" + path, (err) => {
      if (err) return err;

    });

    const userAvatar = new UserAvatar();
    userAvatar.user_id = user.id;
    userAvatar.path = path;
    userAvatar.isCurrentAvatar = 1;
    userAvatar.save();


  }
}

module.exports = D_UserSeeder;
