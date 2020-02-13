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

const User = use("App/Models/User");
const Role = use("App/Models/Role");


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


  }
}

module.exports = D_UserSeeder;
