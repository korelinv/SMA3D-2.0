'use strict';

const express = require('express');
const mongodb = require('mongodb');
const path = require('path');
const cors = require('cors');
const q = require('q');
const bodyparser = require('body-parser');
const request = require('request');
const crypto = require('crypto');
const config = require('./config.json');

const server = function () {

    let shasum = crypto.createHash('sha1');
    const app = express();
    const router = express.Router();
    const sessions = {};
    const mongoClient = mongodb.MongoClient;

    //const Users = new (require('./back/common/users'))(mongoClient,config.database);
    //const Auth = new (require('./back/common/auth'))(mongoClient,config.database,sessions);
    //const Groups = new (require('./back/common/groups'))(mongoClient,config.database);

    const Auth = new (require('./back/api/auth'))(mongoClient,config.database,sessions);

    function FindToken (login, token) {
      var deferred = q.defer();
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          db.collection('users').findOne({"login":login,"token":token}, {_id: 0}, function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else if (result != null) deferred.resolve(result);
            else deferred.reject();
          });
        };
      });
      return deferred.promise;
    };

    function GetUserInfo(login) {
      var deferred = q.defer();
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          db.collection('users').findOne({"login":login}, {_id: 0, token: 0}, function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else if (result != null) deferred.resolve(result);
            else deferred.reject();
          });
        };
      });
      return deferred.promise;
    };
    function CreateNewUser(user) {
      var deferred = q.defer();
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          var token = crypto.createHash('sha1').update(user.password).digest('hex');
          var userInfo = {
            login: user.login,
            token: token,
            name: user.name,
            surname: user.surname,
            patronymic: user.patronymic,
            email: user.email
          };
          db.collection('users').update({"login":user.login}, {$set : userInfo}, {upsert: true}, function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else deferred.resolve();
          });
        };
      });
      return deferred.promise;
    };
    function EditUser(user) {
      var deferred = q.defer();
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          db.collection('users').update({"login":user.login}, {$set : user}, function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else deferred.resolve();
          });
        };
      });
      return deferred.promise;
    };
    function DeleteUser(login) {
      var deferred = q.defer();
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          db.collection('users').remove({"login":login}, function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else deferred.resolve();
          });
        };
      });
      return deferred.promise;
    };
    function AuthenticationBySessionKey(key, ip) {
      var result = false;
      if (sessions[key] == ip) {
        result = true;
      };
      return result;
    };
    function GetUsersList() {
      var deferred = q.defer();
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          db.collection('users').find({}, {"_id":0,"token":0}).toArray(function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else deferred.resolve(result);
          });
        };
      });
      return deferred.promise;
    };

    function GetGroup(id) {
      var deferred = q.defer();
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          db.collection('groups').findOne({"id": id}, {"_id":0}, function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else deferred.resolve(result);
          });
        };
      });
      return deferred.promise;
    };

    function GetGroupsList() {
      var deferred = q.defer();
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          db.collection('groups').find({}, {"_id":0}).toArray(function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else deferred.resolve(result);
          });
        };
      });
      return deferred.promise;
    };
    function EditGroup(group) {
      var deferred = q.defer();
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          db.collection('groups').update({"id":group.id}, {$set : group}, {upsert: true}, function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else deferred.resolve();
          });
        };
      });
      return deferred.promise;
    };
    function GetAuthenticationLog(period) {
      var deferred = q.defer();
      var query = {}
      if (period) {
        query = {date: {}};
        if (period.sdate) query.date.$gte = period.sdate;
        if (period.edate) query.date.$lt = period.edate;
      };
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          db.collection('log').find(query, {"_id":0}).toArray(function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else deferred.resolve(result);
          });
        };
      });
      return deferred.promise;
    };
    function LogAuthentication(ip, login, status) {
      var deferred = q.defer();
      mongoClient.connect(config.database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          db.collection('log').insert({"ip":ip,"login":login,"status":status,"date": new Date()}, function (error, result) {
            db.close();
            if (error) deferred.reject(error);
            else deferred.resolve(result);
          });
        }
      });
      return deferred.promise;
    };

    app.use(cors());
    app.use(bodyparser.urlencoded({extended: true}));
    app.use(bodyparser.json());
    app.use(router);
    app.use(express.static(path.join(__dirname, '/front/public')));


    app.post('/endpoints', function(req, res) {
      var data = req.body;
      if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        res.status(200).send(config.apiEndpoints)
      }
      else res.status(400).send("<h1>400 Bad request. Session key required.</h1>");
    });

    app.get('', function(req, res) {
      res.sendFile(path.join(__dirname + '/front/index.html'));
    });
    app.get('/salt', function(req, res) {
      res.send(crypto.randomBytes(128).toString('Base64'));
    });

    app.post('/authenticate',Auth.Authenticate);
    app.post('/approve', Auth.Approve);
    app.post('/logout', Auth.Logout);

    
    app.post('/userInfo', function(req, res) {
      var data = req.body;
      if (data.login && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        GetUserInfo(data.login)
        .then((result) => {res.status(200).send(result)})
        .catch((error) => {
          if (error) res.send(error);
          else res.status(401).send();
        });
      }
      else res.status(400).send("<h1>400 Bad request</h1>");
    });
    app.post('/newUser', function (req, res) {
      var data = req.body;
      if (data.user && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        CreateNewUser(data.user)
        .then((result) => {res.status(200).send("ok")})
        .catch((error) => {
          if (error) res.send(error);
          else res.status(401).send();
        });
      }
      else res.status(400).send("<h1>400 Bad request</h1>");
    });
    app.post('/editUser',function(req,res) {
      var data = req.body;
      if (data.user && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        EditUser(data.user)
        .then((result) => {res.status(200).send("ok")})
        .catch((error) => {
          if (error) res.send(error);
          else res.status(401).send();
        });
      }
      else res.status(400).send("<h1>400 Bad request</h1>");
    });
    app.post('/deleteUser', function(req, res) {
      var data = req.body;
      if (data.login && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        DeleteUser(data.login)
        .then((result) => {res.status(200).send("ok")})
        .catch((error) => {
          if (error) res.send(error);
          else res.status(401).send();
        });
      }
      else res.status(400).send("<h1>400 Bad request</h1>");
    });
    app.post('/usersList', function(req, res) {
      var data = req.body;
      if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        GetUsersList()
        .then((result) => {res.status(200).send(result)})
        .catch((error) => {
          if (error) res.send(error);
          else res.status(401).send();
        });
      }
      else res.status(400).send("<h1>400 Bad request</h1>");
    });
    app.post('/logs', function(req, res) {
      var data = req.body;
      if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        var period = {
          sdate : new Date(data.sdate),
          edate : new Date(data.edate)
        };
        GetAuthenticationLog(period)
        .then((result) => {
          res.status(200).send(result)
        })
        .catch((error) => {
          if (error) res.send(error);
          else res.status(401).send();
        });
      }
      else res.status(400).send("<h1>400 Bad request</h1>");
    });
    app.post('/groupsList', function(req, res) {
      var data = req.body;
      if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        GetGroupsList()
        .then((result) => {res.status(200).send(result)})
        .catch((error) => {
          if (error) res.send(error);
          else res.status(401).send();
        });
      }
      else res.status(400).send("<h1>400 Bad request</h1>");
    })
    app.post('/newGroup', function(req, res) {
      var data = req.body;
      if (data.group && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        EditGroup(data.group)
        .then((result) => {res.status(200).send("ok")})
        .catch((error) => {
          if (error) res.send(error);
          else res.status(401).send();
        });
      }
      else res.status(400).send("<h1>400 Bad request</h1>");
    });
    app.post('/group', function(req, res) {
      var data = req.body;
      if (data.id && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        GetGroup(data.id)
        .then((result) => {res.status(200).send(result)})
        .catch((error) => {
          if (error) res.send(error);
          else res.status(401).send();
        });
      }
      else res.status(400).send("<h1>400 Bad request</h1>");
    });

    app.listen(config.port, function () {
      console.log("["+config.instance+"] >> started server on port "+config.port);
    });

};
module.exports = new server();
