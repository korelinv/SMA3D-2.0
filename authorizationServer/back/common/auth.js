function FindToken(login, token) {
  let deferred = q.defer();
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
function AuthenticationBySessionKey(key, ip) {
  let result = false;
  if (sessions[key] == ip) {
    result = true;
  };
  return result;
};
function GetAuthenticationLog(period) {
  let deferred = q.defer();
  let query = {}
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
  let deferred = q.defer();
  mongoClient.connect(config.database, function (error, db) {
    if (error) deferred.reject(error);
    else {
      db.collection('log').insert({"ip":ip,"login":login,"status":status,"date": new Date()}, function (error, result) {
        db.close();
        if (error) deferred.reject(error);
        else deferred.resolve(result);
      });
    };
  });
  return deferred.promise;
};
