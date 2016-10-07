function GetGroup(id) {
  let deferred = q.defer();
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
  let deferred = q.defer();
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
  let deferred = q.defer();
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
