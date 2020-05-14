'use strict'

/*
|--------------------------------------------------------------------------
| PrivacySeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const User = use("App/Models/User");
const PrivacySetting = use("App/Models/PrivacySetting");

class PrivacySeeder {
  async run () {
    const findUser = await User.findBy("email", "admin@localhost.local");

    const setting = new PrivacySetting();
    setting.user_id = findUser.id;
    setting.profile_privacy = 'friends';
    setting.who_can_add = 'everyone';

    setting.save()


  }
}

module.exports = PrivacySeeder
