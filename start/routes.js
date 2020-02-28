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



/** ----------------------------------------------------------------
 *                         USER ROUTES
 * ----------------------------------------------------------------
 */


Route.post("/user/register", "UserController.register").middleware(["spoofAccept", "guest"]);

Route.patch("/user/update", "UserController.update").middleware(["spoofAccept", "auth",]);

Route.delete("/user/delete", "UserController.delete").middleware(["spoofAccept", "auth",]);

Route.post("/user/login", "UserController.login").middleware(["spoofAccept", "guest"]);

Route.post( "/user/comparepassword", "UserController.comparePassword").middleware(["spoofAccept", "auth"]);

Route.get("/user/:id", "UserController.getOne").middleware(["spoofAccept", "auth"]);

Route.get("/users", "UserController.getAll").middleware(["spoofAccept", "auth",]);

Route.get("/user", "UserController.getSelf").middleware(["spoofAccept", "auth"]);

Route.get("/users/search", "UserController.search").middleware(["spoofAccept", "auth"]);

Route.post("/user/changeavatar", "UserController.changeProfilePicture").middleware(["spoofAccept", "auth"]);

Route.get("/users/avatars/:userid", "UserController.getAllAvatars").middleware(["spoofAccept", "auth"]);


/** ----------------------------------------------------------------
 *                         MEDIA ROUTES
 * ----------------------------------------------------------------
 */


Route.get("/media/avatar/:userid/:image", "MediaController.getUserAvatar").middleware(["spoofAccept"]);





/** ----------------------------------------------------------------
 *                         FRIEND ROUTES
 * ----------------------------------------------------------------
 */


Route.post("/friends/request/send", "FriendController.sendFriendRequest").middleware(["spoofAccept", "auth"]);

Route.post("/friends/relation", "FriendController.getRelations").middleware(["spoofAccept", "auth"]);

Route.post("/friends/request/accept", "FriendController.acceptFriendRequest").middleware(["spoofAccept", "auth"]);

Route.get("/friends/all/:id", "FriendController.getFriends").middleware(["spoofAccept", "auth"]);
