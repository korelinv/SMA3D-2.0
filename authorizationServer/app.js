var express = require('express');
var mongodb = require('mongodb');
var path = require('path');
var cors = require('cors');
var q = require('q');
var bodyparser = require('body-parser');
var request = require('request');

var crypto = require('crypto');

var Server = function () {};
Server.prototype.Start = function (__config) {
  var shasum = crypto.createHash('sha1');
  var app = express();
  var router = express.Router();

  function FindToken (login, token) {
    var deferred = q.defer();
    app.locals.mongoClient.connect(app.locals.appConfig.database, function (error, db) {
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
    app.locals.mongoClient.connect(app.locals.appConfig.database, function (error, db) {
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
    app.locals.mongoClient.connect(app.locals.appConfig.database, function (error, db) {
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
    app.locals.mongoClient.connect(app.locals.appConfig.database, function (error, db) {
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
    app.locals.mongoClient.connect(app.locals.appConfig.database, function (error, db) {
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
    if (app.locals.sessions[key] == ip) {
      result = true;
    };
    return result;
  };
  function GetUsersList() {
    var deferred = q.defer();
    app.locals.mongoClient.connect(app.locals.appConfig.database, function (error, db) {
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
  function GetGroupsList() {
    var deferred = q.defer();
    app.locals.mongoClient.connect(app.locals.appConfig.database, function (error, db) {
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
    app.locals.mongoClient.connect(app.locals.appConfig.database, function (error, db) {
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
    app.locals.mongoClient.connect(app.locals.appConfig.database, function (error, db) {
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
    app.locals.mongoClient.connect(app.locals.appConfig.database, function (error, db) {
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

  app.locals.mongoClient = mongodb.MongoClient;
  app.locals.appConfig = __config;
  app.locals.sessions = {};

  app.use(cors());
  app.use(bodyparser.urlencoded({extended: true}));
  app.use(bodyparser.json());
  app.use(router);
  app.use(express.static(path.join(__dirname, '/front/public')));


  app.post('/endpoints', function(req, res) {
    var data = req.body;
    if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
      res.status(200).send(app.locals.appConfig.apiEndpoints)
    }
    else res.status(400).send("<h1>400 Bad request. Session key required.</h1>");
  });

  app.get('', function(req, res) {
    res.sendFile(path.join(__dirname + '/front/index.html'));
  });
  app.get('/salt', function(req, res) {
    res.send(crypto.randomBytes(128).toString('Base64'));
  });
  app.post('/authenticate', function(req, res) {
    var data = req.body;
    if (data.login && data.password) {
      var hash = crypto.createHash('sha1').update(data.password).digest('hex');
      FindToken(data.login,hash)
      .then((result) => {
        LogAuthentication(req.ip,data.login,200)
        .then((result) => {
          var sessionKey = crypto.randomBytes(64).toString('Base64') + hash.toString('Base64') + crypto.randomBytes(64).toString('Base64');
          app.locals.sessions[sessionKey] = req.ip;
          res.status(200).send(sessionKey);
        })
        .catch((error) => {res.status(500).send(error)});
      })
      .catch((error) => {
        LogAuthentication(req.ip,data.login,401)
        .then((result) => {res.status(401).send()})
        .catch((error) => {res.status(500).send(error)});
      });
    }
    else {
      LogAuthentication(req.ip,null,400)
      .then((result) => {res.status(400).send("<h1>400 Bad request</h1>")})
      .catch((error) => {res.status(500).send(error)});
    };
  });
  app.post('/approve', function(req, res) {
    var data = req.body;
    if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
      res.status(200).send('ok');
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
  });
  app.post('/logout', function(req, res) {
    var data = req.body;
    if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
      delete app.locals.sessions[data.session];
      res.status(200).send("ok");
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
  });
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


  app.listen(app.locals.appConfig.port, function () {
    console.log("["+app.locals.appConfig.instance+"] >> started server on port "+app.locals.appConfig.port);
  });
  return app;
};
module.exports = new Server();
