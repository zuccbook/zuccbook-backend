'use strict'

/*
|--------------------------------------------------------------------------
| C_RoleSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')
const Role = use("App/Models/Role");
const RolePermission = use("App/Models/RolePermission");
class C_RoleSeeder {
  async run () {
    let groupNames = ["User", "Moderator", "Admin"];

    let groupPermissions =
      [
        [5],
        [2, 3, 4, 5],
        [1]
      ];

    for(let i = 0; i < groupNames.length; i++){

      if(await Role.findBy("name", groupNames[i])) break;

      const role = new Role();
      role.name = groupNames[i];
      role.slug = groupNames[i].toLowerCase();

      await role.save();

      const getRole = await Role.findBy("name", groupNames[i]);

      for(let j = 0; j < groupPermissions[i].length; j++){

        const rolePermission = new RolePermission();

        rolePermission.role_id = getRole.id;
        rolePermission.permission_id = groupPermissions[i][j];

        await rolePermission.save();

      }
    }
  }
}

module.exports = C_RoleSeeder
