'use strict';

const users = function(mongoClient, database) {

    this.GetUserInfo = function(login) {
      let deferred = q.defer();
      mongoClient.connect(database, function (error, db) {
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
    this.CreateNewUser = function(user) {
      let deferred = q.defer();
      mongoClient.connect(database, function (error, db) {
        if (error) deferred.reject(error);
        else {
          let token = crypto.createHash('sha1').update(user.password).digest('hex');
          let userInfo = {
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
    this.EditUser = function(user) {
      let deferred = q.defer();
      mongoClient.connect(database, function (error, db) {
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
    this.DeleteUser = function(login) {
      let deferred = q.defer();
      mongoClient.connect(database, function (error, db) {
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
    this.GetUsersList = function() {
      let deferred = q.defer();
      mongoClient.connect(database, function (error, db) {
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

};

module.exports = users;
