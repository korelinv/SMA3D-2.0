'use strict';

const users = function(mongoClient,database,sessions) {

    const Auth = new (require('../common/auth'))(mongoClient,database,sessions);
    const Users = new (require('../common/users'))(mongoClient,database);

    this.UserInfo = function(req,res) {
        let data = req.body;
        if (data.login && data.session && Auth.AuthenticationBySessionKey(data.session,req.ip)) {
          Users.GetUserInfo(data.login)
          .then((result) => {res.status(200).send(result)})
          .catch((error) => {
            if (error) res.send(error);
            else res.status(401).send();
          });
        }
        else res.status(400).send("<h1>400 Bad request</h1>");
    };
    this.NewUser = function(req,res) {
        let data = req.body;
        if (data.user && data.session && Auth.AuthenticationBySessionKey(data.session,req.ip)) {
          Users.CreateNewUser(data.user)
          .then((result) => {res.status(200).send("ok")})
          .catch((error) => {
            if (error) res.send(error);
            else res.status(401).send();
          });
        }
        else res.status(400).send("<h1>400 Bad request</h1>");
    };
    this.EditUser = function(req,res) {};
    this.DeleteUser = function(req,res) {};
    this.UsersList = function(req,res) {};

};

module.exports = users;
