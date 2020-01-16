'use strict';

/*
|--------------------------------------------------------------------------
| UserSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory');

const User = use("App/Models/User");

class UserSeeder {
  async run () {

    if(await User.findBy("email", "admin@localhost.local")) return;

    const user = new User();

    user.firstname = "admin";
    user.lastname = "admin";
    user.email = "admin@localhost.local";
    user.password = "admin";

    await user.save();

  }
}

module.exports = UserSeeder;
