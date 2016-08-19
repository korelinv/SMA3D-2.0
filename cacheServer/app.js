var express = require('express');
var mongodb = require('mongodb');
var request = require('request');
var uuid = require('uuid-lib');
var schedule = require('node-schedule');
var querystring = require('querystring');
var parseString = require('xml2js').parseString;
var q = require('q');


var Server = function () {};

Server.prototype.Start = function (__config) {
  var app = express();

  app.locals.mongoClient = mongodb.MongoClient;
  app.locals.appConfig = null;
  app.locals.Jobs = {};

  if (__config) app.locals.appConfig = __config;


  var Job = function (__id,__schedule,__action) {
    this.schedule = __schedule;
    this.id = __id;
    this.action = __action;
    this.ref = null;
  };
  Job.prototype.Start = function () {
    this.ref = schedule.scheduleJob(this.schedule,this.action);
  };
  Job.prototype.Stop = function () {
    this.ref.cancel();
  };


  function LaunchJob (__id, __schedule, __action) {
    if (app.locals.Jobs[__id]) app.locals.Jobs[__id].Stop();
    app.locals.Jobs[__id] = new Job(__id,__schedule,__action);
    app.locals.Jobs[__id].Start();
  };

  function ShutDownJob (__id) {
    if (app.locals.Jobs[__id]) {
      app.locals.Jobs[__id].Stop();
      delete app.locals.Jobs[__id];
    };
  };

  function CreatePlan () {
    var deferred = q.defer();

    RequestCachable()
    .then(FormCatalogItems)
    .then(function (result) {
      deferred.resolve();
    })
    .catch(function (error) {
      AppendErrorStack(error,app.locals.appConfig.instance,CreatePlan);
      deferred.reject(error);
    });

    return deferred.promise;
  };

  function RequestCachable () {
    var deferred = q.defer();
    var parameters = {
      "method": "GET",
      "url": app.locals.appConfig.snapshot_service,
      "headers": {
        "auth": "some"
      }
    };
    request.get(parameters, function (error, response, body) {
        if (error)
          deferred.reject(FormErrorStack(app.locals.appConfig.instance,RequestCachable,error));
        else if (response.statusCode != 200)
          deferred.reject(FormErrorStack(app.locals.appConfig.instance,RequestCachable,"response.statusCode=" + response.statusCode));
        else
          deferred.resolve(JSON.parse(body));
    });
    return deferred.promise;
  };

  function ConnectToDatabase () {
    var deferred = q.defer();
    app.locals.mongoClient.connect(app.locals.appConfig.database, function(error, db) {
      if (error)
        deferred.reject(FormErrorStack(app.locals.appConfig.instance,ConnectToDatabase,error));
      else
        deferred.resolve(db);
    });
    return deferred.promise;
  };

  function FormCatalogItems(list) {
    var deferred = q.defer();
    Iterate(list, 0, Digest,
      (error) => {
        AppendErrorStack(error,app.locals.appConfig.instance,FormCatalogItems);
        deferred.reject(error);
      },
      (result) => {deferred.resolve()}
    );
    return deferred.promise;
  };

  function Digest(element) {
    var deferred = q.defer();
    var __db = null;

    var catalogItem;
    if (app.locals.appConfig.cache_type == "regular") catalogItem = ToRegularCatalogItem(element);
    else if (app.locals.appConfig.cache_type == "book") catalogItem = ToBookCatalogItem(element);

    RequestDescriptor(catalogItem)
    .then((result) => {
      catalogItem = CompleteCatalogItem(catalogItem,result);
      return ConnectToDatabase();
    })
    .then((db) => {
      __db = db;
      return StoreCatalogItem(__db,catalogItem);
    })
    .then((result) => {
      return DropOutdatedData(__db,result.value.id);
    })
    .then(() => {
      __db.close();
      LaunchJob(catalogItem.id,catalogItem.schedule,function () {CacheData(catalogItem)});
      deferred.resolve();
    })
    .catch((error) => {
      AppendErrorStack(error,app.locals.appConfig.instance,RegularDigest);
      deferred.reject(error);
    });
    return deferred.promise;
  };

  function ToRegularCatalogItem (snapshot) {

    var request = {};
    var parameters = {};
    snapshot.settings.modificators.forEach(function(value,index,array) {
      if ((value.dependency) && (snapshot.settings.variables[value.affectorId])) {
        if (snapshot.settings.variables[value.affectorId].type == value.type)
          parameters[value.id] = snapshot.settings.variables[value.affectorId].value;
      }
      else
        parameters[value.id] = value.value;
    });
    snapshot.settings.fields.forEach(function(value,index,array) {
      request[value.id] = value.path;
    });
    return {
      id: uuid.raw(),
      key: {
        id: snapshot.settings.dataset,
        parameters: parameters,
        request: request
      }
    };
  };

  function ToBookCatalogItem (descriptor) {
    return {
      id: uuid.raw(),
      key: {
        id: descriptor.id,
        parameters: descriptor.service.parameters,
        request: descriptor.collection.bookRequest
      },
      service: descriptor.service,
      collection: descriptor.collection,
      compiled: descriptor.compiled,
      schedule: descriptor.schedule
    };
  };

  function StoreCatalogItem (db,item) {
    var deferred = q.defer();
    db.collection('catalog').findAndModify({"key": item.key},{},item,{upsert: true, new: false},function (error, result) {
      if (error) {
        db.close();
        deferred.reject(FormErrorStack(app.locals.appConfig.instance,StoreCatalogItem,error));
      }
      else deferred.resolve(result);
    });
    return deferred.promise;
  };

  function RemoveCatalogItem(db, id) {
    var deferred = q.defer();
    db.collection('catalog').remove({"key.id": id}, function(error, result) {
      if (error) {
        db.close();
        deferred.reject(FormErrorStack(app.locals.appConfig.instance,RemoveCatalogItem,error));
      }
      else deferred.resolve();
    });
    return deferred.promise;
  };

  function RequestDescriptor(item) {
    var deferred = q.defer();
    var parameters = {
      "method": "GET",
      "url": app.locals.appConfig.descriptor_service+"?id="+item.key.id,
      "headers": {
        "auth": "some"
      }
    };
    request.get(parameters, function (error, response, body) {
      if (error)
        deferred.reject(FormErrorStack(app.locals.appConfig.instance,RequestDescriptor,error));
      else if (response.statusCode != 200)
        deferred.reject(FormErrorStack(app.locals.appConfig.instance,RequestDescriptor,"response.statusCode=" + response.statusCode));
      else deferred.resolve(JSON.parse(body));
    });
    return deferred.promise;
  }

  function CompleteCatalogItem(item, descriptor) {
    item.schedule = descriptor.schedule;
    item.service = descriptor.service;
    item.collection = descriptor.collection;
    item.compiled = descriptor.compiled;
    return item;
  };

  function Iterate(collection,pointer,action,error,callback) {
      action(collection[pointer])
      .then(function () {
        if (collection[pointer + 1] != undefined) {
            process.nextTick(function () {
                pointer++;
                Iterate(collection,pointer,action,error,callback);
            });
        }
        else {
            process.nextTick(function () {
                callback();
            });
        };
      })
      .catch(function () {
        AppendErrorStack(error,app.locals.appConfig.instance,Iterate);
        error();
      });
  };

  function CacheData(item) {

    var url;
    if (app.locals.appConfig.cache_type == "regular") url = app.locals.appConfig.router + '/getDatasource'
    else if (app.locals.appConfig.cache_type == "book") url = app.locals.appConfig.router + '/getDatasource?book=1'

    var options = {
        url: url,
        method: 'POST',
        headers: {
            'Content-Type':'Content-Type: application/json;charset=utf-8'
        },
        form: item.key
    };
    request(options, function(error, response, body) {
      if (error) FormErrorStack(app.locals.appConfig.instance,request,error);
      else {
        var cache = JSON.parse(body)
        var __db;
        ConnectToDatabase()
        .then((db) => {
          __db = db;
          return DropOutdatedData(__db,item.id);
        })
        .then(() => {
          return StoreCachedData(__db,item.id,cache);
        })
        .then(() => {
          __db.close();
          console.log("["+app.locals.appConfig.instance+"] >> " + item.id + " cached");
        })
        .catch((error) => {
          AppendErrorStack(error,app.locals.appConfig.instance,CacheData);
          console.log(error);
        });
      };
    });
  };

  function DropOutdatedData (__db, __id) {
    var deferred = q.defer();
    __db.collection(__id).drop(function (error, response) {deferred.resolve()});
    return deferred.promise;
  };

  function RemoveOldCachedData (__db, __id) {
    var deferred = q.defer();
    __db.collection(__id).remove({},function (error, response) {
      if (error) deferred.reject(FormErrorStack(app.locals.appConfig.instance,RemoveOldCachedData,error));
      else deferred.resolve();
    });
    return deferred.promise;
  };

  function StoreCachedData (__db, __id, __data) {
    var deferred = q.defer();
    __db.collection(__id).insert(__data, function (error, result) {
      if (error) {
        __db.close();
        deferred.reject(FormErrorStack(app.locals.appConfig.instance,StoreCachedData,error));
      }
      else deferred.resolve();
    });
    return deferred.promise;
  };

  function FindIdByKey (__db, __key) {
    var deferred = q.defer();
    __db.collection('catalog').findOne({"key":key},{"_id":0,"id":1}, function(error, result) {
      if (error) deferred.reject(FormErrorStack(app.locals.appConfig.instance,FindIdByKey,error))
      else deferred.resolve(result);
    });
    return deferred.promise;
  };

  function CreateMethodCallMessage (__instance, __method) {
    return {
      instance: __instance,
      method: __method.name
    };
  };
  function CreateErrorMessage (__instance, __method, __details) {
    return {
      instance: __instance,
      method: __method.name,
      details: __details
    };
  }
  function FormErrorStack (__instance, __method, __details) {
    return [CreateErrorMessage(__instance, __method, __details)];
  };
  function AppendErrorStack (__error,__instance, __method) {
    __error.push(CreateMethodCallMessage(__instance, __method));
    return __error;
  };


  app.post('/item', function(req, res) {
    var headers = req.headers;
    var key = req.body;
    if (headers.auth) {
      var __db;
      if (key) {
        ConnectToDatabase()
        .then((db) => {
          __db = db;
          return FindIdByKey(__db,key);
        })
        .then((item) => {
          if (item) {
            app.locals.Jobs[item.id].Stop();
            RemoveCatalogItem(__db, item.id)
            .then(() => {return DropOutdatedData(__db,item.id)})
            .then(() => {
              __db.close();
              res.status(200).send("ok");
            })
            .catch((error) => {
              __db.close();
              AppendErrorStack(error,app.locals.appConfig.instance,RemoveCatalogItem);
              console.log(error);
              res.status(500).send(error)
            });
          }
          else res.status(404).send("<h1>404 Not found</h1>")
        })
        .catch((error) => {
          db.close();
          AppendErrorStack(error,app.locals.appConfig.instance,app.post);
          console.log(error);
          res.status(500).send(error)
        });
      }
      else {
        res.status(400).send("<h1>400 Bad request</h1>");
      };
    }
    else {
      res.status(403).send("<h1>403 Forbidden</h1>");
    };
  });

  app.post('/item', function (req, res) {
    var headers = req.headers;
    var data = req.body;

    if (headers.auth) {
      if (data) {
        var __db = null;
        var catalogItem = ToRegularCatalogItem(data);
        RequestDescriptor(catalogItem)
        .then((result) => {
          catalogItem = CompleteCatalogItem(catalogItem,result);
          return ConnectToDatabase();
        })
        .then((db) => {
          __db = db;
          return StoreCatalogItem(__db,catalogItem);
        })
        .then((result) => {
          __db.close();
          LaunchJob(catalogItem.id,catalogItem.schedule,function () {CacheData(catalogItem)});
          res.status(200).send("ok");
        })
        .catch((error) => {
          __db.close();
          AppendErrorStack(error,app.locals.appConfig.instance,app.post);
          console.log(error);
          res.status(500).send(error);
        });
      }
      else
        res.status(400).send("<h1>400 Bad request</h1>");
    }
    else
      res.status(403).send("<h1>403 Forbidden</h1>");
  });

  app.get('/cache/:id', function (req, res) {
    var id = req.params.id;
    ConnectToDatabase()
    .then((db) => {
      db.collection(id).find({},{"_id":0}).toArray(function (error, result) {
        db.close();
        if (error) res.status(500).send(error);
        else res.status(200).send(result);
      });
    })
    .catch((error) => {
      res.status(500).send("<h1>500 Internal server error</h1>");
    });
  });

  app.get('/catalog', function (req, res) {
    var query = req.query;
    var filter = {
      "_id":0,
      "id":1
    };
    if (query.detailed) {
      if (query.detailed == 1) filter = {
        "_id":0,
        "id":1,
        "key":1/*,
        "schedule": 1,
        "service": 1,
        "compiled": 1,
        "collection": 1*/
      };
    };
    ConnectToDatabase()
    .then((db) => {
      db.collection('catalog').find({},filter).toArray(function (error, result) {
        db.close();
        if (error) res.status(500).send(error);
        else res.status(200).send(result);
      });
    })
    .catch((error) => {
      res.status(500).send("<h1>500 Internal server error</h1>");
    });
  });

  app.post('/cache', function (req, res) {
    var key = req.body;
    if (key) {
      var __db;
      ConnectToDatabase()
      .then((db) => {
        __db = db;
        return FindIdByKey(__db,key);
      })
      .then((item) => {
        if (item) {
          __db.collection(item.id).find({},{"_id":0}).toArray(function (error, result) {
            __db.close();
            if (error) res.status(500).send(error);
            else res.status(200).send(result);
          });
        }
        else res.status(404).send("<h1>404 Not found</h1>");
      })
      .catch((error) => {
        __db.close();
        res.status(500).send("<h1>500 Internal server error</h1>");
      });
    }
    else res.status(400).send("<h1>400 Bad request</1>");
  });

  app.get('/jobs', function (req, res) {
    var headers = req.headers;
    if (headers.auth) {
      var __jobs = [];
      for (var item in app.locals.Jobs) {
        __jobs.push({
          id: app.locals.Jobs[item].id,
          schedule: app.locals.Jobs[item].schedule
        });
      };
      res.status(200).send(__jobs);
    }
    else res.status(403).send("<h1>403 Forbidden</h1>")
  });

  app.listen(app.locals.appConfig.port, function () {
    console.log("["+app.locals.appConfig.instance+"] >> started cache server on port "+app.locals.appConfig.port);
    CreatePlan()
    .then((result) => {
      console.log("["+app.locals.appConfig.instance+"] >> plan created");
    })
    .catch((error) => {
      AppendErrorStack(error,app.locals.appConfig.instance,app.listen);
      console.log(error);
    });
  });

  return app;
};

module.exports = new Server();
