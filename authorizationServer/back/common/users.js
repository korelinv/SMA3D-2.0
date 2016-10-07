function GetUserInfo(login) {
  let deferred = q.defer();
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
  let deferred = q.defer();
  mongoClient.connect(config.database, function (error, db) {
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
function EditUser(user) {
  let deferred = q.defer();
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
  let deferred = q.defer();
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
function GetUsersList() {
  let deferred = q.defer();
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
