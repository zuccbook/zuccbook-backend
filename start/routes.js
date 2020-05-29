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

Route.patch( "/user/update/requirePass", "UserController.updateAndRequirePass").middleware(["spoofAccept", "auth"]);

Route.get("/user/:id", "UserController.getOne").middleware(["spoofAccept", "auth"]);

Route.get("/users", "UserController.getAll").middleware(["spoofAccept", "auth",]);

Route.get("/user", "UserController.getSelf").middleware(["spoofAccept", "auth"]);

Route.get("/users/search", "UserController.search").middleware(["spoofAccept", "auth"]);

Route.post("/user/changeavatar", "UserController.changeProfilePicture").middleware(["spoofAccept", "auth"]);

Route.get("/users/avatars/:userid", "UserController.getAllAvatars").middleware(["spoofAccept", "auth"]);

Route.patch("/users/privacy/request/change", "UserController.changeFriendRequestPrivacy").middleware(["spoofAccept", "auth"]);

Route.patch("/users/privacy/profile/change", "UserController.changeProfilePrivacy").middleware(["spoofAccept", "auth"]);



/** ----------------------------------------------------------------
 *                         MEDIA ROUTES
 * ----------------------------------------------------------------
 */


Route.get("/media/avatar/:userid/:image", "MediaController.getUserAvatar").middleware(["spoofAccept"]);
Route.get("/media/post/:postid/:file", "MediaController.getPostFile").middleware(["spoofAccept"]);






/** ----------------------------------------------------------------
 *                         FRIEND ROUTES
 * ----------------------------------------------------------------
 */


Route.post("/friends/request/send", "FriendController.sendFriendRequest").middleware(["spoofAccept", "auth"]);

Route.post("/friends/relation", "FriendController.getRelations").middleware(["spoofAccept", "auth"]);

Route.post("/friends/request/accept", "FriendController.acceptFriendRequest").middleware(["spoofAccept", "auth"]);

Route.get("/friends/all/:id", "FriendController.getFriends").middleware(["spoofAccept", "auth"]);

Route.get("/friends/request/all", "FriendController.getFriendRequests").middleware(["spoofAccept", "auth"]);

Route.post("/friends/request/deny", "FriendController.denyFriendRequest").middleware(["spoofAccept", "auth"]);

Route.delete("/friends/request/cancel", "FriendController.CancelFriendRequest").middleware(["spoofAccept", "auth"]);

Route.delete("/friend/delete", "FriendController.removeFriend").middleware(["spoofAccept", "auth"]);



/** ----------------------------------------------------------------
 *                         POST ROUTES
 * ----------------------------------------------------------------
 */

Route.post("/post/create", "PostController.createPost").middleware(["spoofAccept", "auth"]);

Route.patch("/post/update", "PostController.updatePost").middleware(["spoofAccept", "auth"]);

Route.get("/posts/get", "PostController.getPosts").middleware(["spoofAccept", "auth"]);

Route.get("/post/get", "PostController.getPost").middleware(["spoofAccept", "auth"]);

Route.delete("/post/delete", "PostController.deletePost").middleware(["spoofAccept", "auth"]);

Route.post('/post/comment/create','PostController.commentPost').middleware(['spoofAccept',"auth"])

Route.get('/post/comments/:postId','PostController.getComments').middleware(['spoofAccept','auth'])

Route.delete('/post/comments/delete','PostController.deleteComment').middleware(['spoofAccept','auth'])

Route.patch('/post/comments/update','PostController.updateComment').middleware(['spoofAccept','auth'])

Route.get('/post/user/:id', 'PostController.getPostsFromSpecificUser').middleware(['spoofAccept','auth'])

Route.post('/post/like', 'PostController.likePost').middleware(['spoofAccept','auth'])

Route.delete('/post/unlike', 'PostController.unlikePost').middleware(['spoofAccept','auth'])

Route.post('/post/dislike', 'PostController.dislikePost').middleware(['spoofAccept','auth'])

Route.delete('/post/undislike', 'PostController.undislikePost').middleware(['spoofAccept','auth'])

Route.get("/post/user/files/:id", "PostController.getFilesPostedByUser").middleware(["spoofAccept", "auth"]);



/** ----------------------------------------------------------------
 *                         NOTIFICATION ROUTES
 * ----------------------------------------------------------------
 */
Route.get('/notifications/all','NotificationController.getAllNotifications').middleware(['spoofAccept','auth'])

Route.get('/notifications/unread','NotificationController.getUnreadNotifications').middleware(['spoofAccept','auth'])

