'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URLs and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.1/routing
|
*/

/** @type {typeof import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

/** ----------------------------------------------------------------
 *                         USER ROUTES
 * ----------------------------------------------------------------
 */


Route.post("/user/register", "UserController.register").middleware(["spoofAccept", "guest"]);

Route.patch("/user/update", "UserController.update").middleware(["spoofAccept", "auth", "can:(user_update or all_permissions)"]);

Route.delete("/user/delete", "UserController.delete").middleware(["spoofAccept", "auth", "can:(user_update or delete)"]);

Route.post("/user/login", "UserController.login").middleware(["spoofAccept", "guest"]);

Route.post( "/user/comparepassword", "UserController.comparePassword").middleware(["spoofAccept", "auth"]);

Route.get("/users/:id", "UserController.getOne").middleware(["spoofAccept", "auth", "can:(user_get or all_permissions)"]);

Route.get("/users", "UserController.getAll").middleware(["spoofAccept", "auth", "can:(user_getall or all_permissions)"]);

Route.get("/user", "UserController.getSelf").middleware(["spoofAccept", "auth"]);

Route.get("/user/search", "UserController.search").middleware(["spoofAccept", "auth"]);

