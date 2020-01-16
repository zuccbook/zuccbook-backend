'use strict';

const { validate } = use('Validator');

const User = use("App/Models/User");

const Hash = use('Hash');

class UserController {
  async add({ request, response }) {

    const rules = {
      first_name: "required",
      last_name: "required",
      email: "required|email|unique:users,email",
      password: "required"
    };

    const body = request.only(["first_name", "last_name", "email", "password"]);

    // Validate input.
    const validation = await validate(body, rules);

    if(validation.fails()) {
      return response.status(400).json({
        status: "Error",
        message: validation.messages()
      });
    }

    const user = new User();

    user.firstname = body.first_name;
    user.lastname = body.last_name;
    user.email = body.email;
    user.password = body.password;

    await user.save();

    return response.status(200).json({
      status: "Success",
      message: "The user was successfully created."
    });
  }

  async update({ request, auth, response }) {

    const user = await User.find(request.only("id").id);

    if(!user) {
      return response.status(400).json({
        status: "Error",
        message: "Request was malformed"
      });
    }

    const rules = {
      first_name: "required",
      last_name: "required",
      email: "required|email",
      password: "required"
    };

    const body = {};

    body.first_name = request.input("first_name", user.firstname);
    body.last_name = request.input("last_name", user.lastname);
    body.email = request.input("email", user.email);
    body.password = request.input("password", user.password);

    const validation = await validate(body, rules);

    if(validation.fails()) {
      return response.status(400).json({
        status: "Error",
        message: validation.messages()
      });
    }

    user.firstname = body.first_name;
    user.lastname = body.last_name;
    user.email = body.email;
    user.password = body.password;

    await user.save();

    return response.status(200).json({
      status: "Success",
      message: "The user was successfully updated."
    });
  }

  async delete({ request, auth, response }) {
    const user = await User.find(request.only("id").id);

    if(!user) {
      return response.status(400).json({
        status: "Error",
        message: "Request was malformed"
      });
    }

    await user.delete();

    return response.status(200).json({
      status: "Success",
      message: "The user was successfully deleted."
    });
  }

  async getOne({ request, params, auth, response }) {
    const user = await User.find(params.id);

    if(!user) {
      return response.status(404).json({
        status: "Error",
        message: "Could not find the specified user."
      });
    }

    return response.status(200).json({
      status: "Success",
      message: "The user was successfully found.",
      data: user
    });
  }

  async getAll({ request, params, auth, response }) {
    const users = await User.query().paginate(request.input("page", 1), request.input("limit", 20));

    if(!users) {
      return response.status(404).json({
        status: "Error",
        message: "Could not get the users"
      });
    }

    return response.status(200).json({
      status: "Success",
      message: "The users was successfully found.",
      data: users
    });
  }

  async login({ request, auth, response }) {
    const rules = {
      email: "required|email",
      password: "required"
    };

    const body = request.only(["email", "password"]);

    const validation = await validate(body, rules);

    if(validation.fails()) {
      return response.status(400).json({
        status: "Error",
        message: validation.messages()
      });
    }

    const jwt = await auth.attempt(body.email, body.password);

    if(!jwt) {
      return response.status(500).json({
        status: "Error",
        message: "Unknown error"
      });
    }

    return response.status(200).json({
      status: "Success",
      message: "You have been successfully logged in.",
      data: jwt
    });
  }

  async getSelf({ request, auth, response }) {

    return response.status(200).json({
      status: "Success",
      message: "The user was successfully found.",
      data: await auth.getUser()
    });
  }

  async comparePassword({ request, auth, response }){
    const isSame = await Hash.verify( request.input("password"), request.input("hash") );
    if( isSame ) {
      return response.status(200).json({
        status: "Success",
        message: "The passwords match."
      })
    } else {
      return response.status(401).json({
        status: "Error",
        message: "No match"
      })
    }
  }
}

module.exports = UserController;
