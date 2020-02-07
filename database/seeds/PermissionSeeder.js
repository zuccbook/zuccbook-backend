'use strict'

/*
|--------------------------------------------------------------------------
| PermissionSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Permission = use("App/Models/Permission");

class PermissionSeeder {
  async run () {
    let list =
      [
        "ALL_PERMISSIONS",

        "USER_CREATE",
        "USER_DELETE",
        "USER_UPDATE",
        "USER_GET",
        "USER_GETALL",

        "USER_GROUP_ADD",
        "USER_GROUP_DELETE",
        "USER_GROUP_GETALL",

        "GROUP_CREATE",
        "GROUP_DELETE",
        "GROUP_UPDATE",
        "GROUP_GETALL",

        "PERMISSION_CREATE",
        "PERMISSION_DELETE",
        "PERMISSION_UPDATE",
        "PERMISSION_GETALL",

        "GROUP_PERMISSION_ADD",
        "GROUP_PERMISSION_DELETE",
        "GROUP_PERMISSION_GETALL",

      ];

    for(let i = 0; i < list.length; i++){

      if(await Permission.findBy("slug", list[i])) continue;

      const permission = new Permission();
      permission.id = i+1;
      permission.slug = list[i].toLowerCase();

      await permission.save();

    }
  }
}

module.exports = PermissionSeeder
