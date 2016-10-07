var express = require('express');
var cors = require('cors');
var path = require('path');
var mongodb = require('mongodb');
var bodyparser = require('body-parser');
var guid = require('uuid-lib');
//var schedule = require('node-schedule');
var querystring = require('querystring');
var request = require('request');
//var parseString = require('xml2js').parseString;
var q = require('q');



//var CacheServer = require('./cacheServer/app.js');
var LiveServer = require('./liveServer/app.js');
//var ImageServer = require('./imageServer/app.js');
//var AuthorizationServer = require('./authorizationServer/app.js');


var app = express();
var router = express.Router();
var mongoClient = mongodb.MongoClient;

// server config
var port = 8090;
var publicFolderPath = "/front/public";


// database config object
var dbConfig = {
    //basics
    url: 'localhost',
    port: 27017,
    name: {
        system: 'platform',
        cacheData: 'cache',
        cacheBooks: 'books'
    },

    // returns request path fo system part of database
    SysPath: function () {
        return 'mongodb://'+this.url+':'+this.port+'/'+this.name.system;
    }
}


// CROSSDOMAIN FOR UNITY SANDBOX
app.use(cors());


// midleware
// request parsing
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());
// routing and public folder
app.use(router);
app.use(express.static(path.join(__dirname, publicFolderPath)));
app.use(express.static(path.join(__dirname, 'adminConsole/front/public')));




//<LEGACY>
app.get('/service', function (req,res) {
    var id = req.query.id;
    mongoClient.connect(dbConfig.SysPath(), function (error, db) {
        if (error)
            res.status(500).send(error);
        else {
            var collection = db.collection('servicesLegacy');
            if (!id) {
                collection.find({},{"_id":0}).toArray(function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.send(result);
                });
            }
            else {
                collection.findOne({"id":id},{"_id":0}, function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.send(result);
                });
            };
        };
    });
});
app.get('/snapshot', function (req,res) {
    var request = req.query;
    mongoClient.connect(dbConfig.SysPath(), function (error, db) {
        if (error)
            res.status(500).send(error);
        else {
            var collection = db.collection('snapshotsLegacy');
            if (request.all == "true") {
                collection.find({},
                  {
                    "_id":0,
                    "settings.variables": 0,
                    "settings.fields": 0,
                    "settings.actions": 0,
                    "settings.enumerators": 0,
                    "settings.modificators": 0,
                    "settings.dataset": 0,
                    "settings.__type": 0,
                    "factories": 0,
                    "children":0,
                    "__type": 0
                  }
                ).toArray(function(error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.send(result);
                });
            }
            else if (request.id) {
                collection.findOne({"id":request.id},{"_id":0}, function(error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.send(result);
                });
            }
            else
                res.send({});
        };
    });
});
app.post('/edit/service', function (req,res) {
    var data = req.body;
    if (data.id) {
        mongoClient.connect(dbConfig.SysPath(), function (error, db) {
            if (error)
                res.status(500).send(error);
            else {
                var collection = db.collection('servicesLegacy');
                collection.findAndModify({"id":data.id},[],{$set: data},{upsert: true}, function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.status(200).send("ok");
                });
            };
        });
    }
    else
        res.status(500).send("id required");
});
app.post('/remove/service', function (req,res) {
    var data = req.body;
    if (data.id) {
        mongoClient.connect(dbConfig.SysPath(), function (error, db) {
            if (error)
                res.status(500).send(error);
            else {
                var collection = db.collection('servicesLegacy');
                collection.remove({"id":data.id}, function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.status(200).send("ok");
                });
            };
        });
    }
    else
        res.status(500).send("id required");
});
app.get('/snapshot/depended', function (req, res) {
    var data = req.query;
    if (data.id) {
        mongoClient.connect(dbConfig.SysPath(), function (error, db) {
            if (error)
                res.status(500).send(error);
            else {
                var collection = db.collection('snapshotsLegacy');
                collection.find({children: {$elemMatch: {id:data.id}}}).toArray(function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else {
                        res.status(200).send(result);
                    };
                });
              };
        });
    }
    else
        res.status(500).send("id required");
});
app.post('/remove/snapshot', function (req,res) {
    var data = req.body;
    if (data.id) {
        mongoClient.connect(dbConfig.SysPath(), function (error, db) {
            if (error)
                res.status(500).send(error);
            else {
                var collection = db.collection('snapshotsLegacy');
                collection.remove({"id":data.id}, function (error, result) {
                    if (error) {
                        db.close();
                        res.status(500).send(error);
                    }
                    else {
                        collection.update({},{$pull: {children: {id: data.id}}},{multi: true}, function (error, result) {
                            db.close();
                            if (error)
                                res.status(500).send(error);
                            else
                                res.status(200).send("ok");
                        });
                    };
                });
            };
        });
    }
    else
        res.status(500).send("id required");
});
app.post('/edit/snapshot', function (req,res) {
    var data = req.body;
    if (data.id) {
        mongoClient.connect(dbConfig.SysPath(), function (error, db) {
            if (error)
                res.status(500).send(error);
            else {
                var collection = db.collection('snapshotsLegacy');
                collection.findAndModify({"id":data.id},[],{$set: data},{upsert: true}, function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.status(200).send("ok");
                });
            };
        });
    }
    else
        res.status(500).send("id required");
});
app.post('/edit/snapshot/addChildren', function (req,res) {
    var data = req.body;
    if (data.id) {
        mongoClient.connect(dbConfig.SysPath(), function (error, db) {
            if (error)
                res.status(500).send(error);
            else {
                var collection = db.collection('snapshotsLegacy');
                collection.update({"id":data.id},{$addToSet: {children: {$each: data.children}}}, function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.status(200).send("ok");
                });
            };
        });
    }
    else
        res.status(500).send("id required");
});
app.post('/edit/snapshot/removeChild', function (req,res) {
    var data = req.body;
    if (data.id) {
        mongoClient.connect(dbConfig.SysPath(), function (error, db) {
            if (error)
                res.status(500).send(error);
            else {
                var collection = db.collection('snapshotsLegacy');
                collection.update({"id":data.id},{$pull: {children: {id: data.child}}}, function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.status(200).send("ok");
                });
            };
        });
    }
    else
        res.status(500).send("id required");
});
app.get('/models', function (req,res) {
    mongoClient.connect(dbConfig.SysPath(), function (error, db) {
        if (error)
            res.status(500).send(error);
        else {
            var collection = db.collection('modelsLegacy');
            collection.find({},{"_id":0}).toArray(function (error, result) {
                db.close();
                if (error)
                    res.status(500).send(error);
                else
                    res.send(result);
            });
        }
    });
});
app.post('/models/:mode', function(req, res) {
  var mode = req.params.mode;
  var data = req.body;
  switch (mode) {

    case "edit":
      mongoClient.connect(dbConfig.SysPath(),function(error, db) {
        if (error)
          res.status(500).send(error);
        else {
          var collection = db.collection('modelsLegacy');
          collection.update({id: data.id},{$set: data},{upsert: true}, function (error, result) {
            if (error)
              res.status(500).send(error);
            else
              res.status(200).send("ok");
          });
        };
      });
      break;

    case "delete":
      mongoClient.connect(dbConfig.SysPath(),function(error, db) {
        if (error)
          res.status(500).send(error);
        else {
          var collection = db.collection('modelsLegacy');
          collection.remove({id: data.id}, function(error, result) {
            if (error)
              res.status(500).send(error);
            else
              res.status(200).send("ok");
          });
        };
      });
      break;

    default:
      res.status(501).send("not implemented");
      break;
  };
});
app.get('/descriptors',function (req,res) {
    var id = req.query.id;
    if (id) {
        mongoClient.connect(dbConfig.SysPath(), function (error, db) {
            if (error)
                res.status(500).send(error);
            else {
                var collection = db.collection('descriptorsLegacy');
                collection.findOne({"id":id},{"_id":0}, function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else{
                        if (result != null)
                            res.send(result.data);
                        else
                            res.send();
                    };
                });
            }
        });
    }
    else
        res.status(500).send("id required");
});
//</LEGACY>





// системные сервисы
app.post('/sconfig', function(req, res) {
    var data = req.body;
    mongoClient.connect(dbConfig.SysPath(), function (error, db) {
        if (error)
            res.status(500).send(error);
        else {
            var collection = db.collection('sourcePaths');
            collection.findOne({id:data.role},{_id:0},function (error, result) {
                db.close();
                if (error)
                    res.status(500).send(error);
                else {
                    res.send(result);
                };
            });
        };
    });
});
app.get('/getUuid', function (req, res) {
    var quantity = req.query.q;
    if ((quantity == 1) || (quantity == undefined)) {
        res.send(guid.raw());
    }
    else if (quantity > 1) {
        if (quantity > 10)
            quantity = 10;
        var result = [];
        for (var i = 0; i < quantity; i++) {
            result.push(guid.raw());
        };
        res.send(result);
    }
    else {
        res.send("ivalid quantity");
    };
});
app.get('/cache/:type', function (req, res) {
  var headers = req.headers;
  var type = req.params.type;
  if (headers.auth) {
    mongoClient.connect(dbConfig.SysPath(), function(error, db) {
      if (error)
        res.status(500).send(error);
      else {
        if (type == "regular") {
          db.collection('snapshotsLegacy')
          //.find({ $or: [{"settings.dataset":{$ne: ''}},{"factories":{$ne: []}}]  },{"_id": 0})
          .find({"settings.dataset":{$ne: ''}},{"_id": 0})
          .toArray(function (error, result) {
            db.close();
            res.status(200).send(result);
          });
        }
        else if (type == "book") {
          db.collection('descriptors')
          .find({"service.referenceBook": true},{"_id": 0})
          .toArray(function (error, result) {
            db.close();
            res.status(200).send(result);
          });
        }
        else {
          db.close();
          res.status(400).send("<h1>400 Bad request<h1>");
        };
      };
    });
  }
  else
    res.status(403).send("<h1>403 Forbidden<h1>");
});
app.get('/descriptor', function (req, res) {
    var data = req.query;
    mongoClient.connect(dbConfig.SysPath(), function (error, db) {
        if (error)
            res.status(500).send(error);
        else {
            var collection = db.collection('descriptors');
            if (data.id) {
                collection.findOne({"id":data.id},{"_id":0}, function(error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else if (!result) res.status(404).send("<h1>404 Not found</h1>");
                    else res.status(200).send(result);
                });
            }
            else {
                collection.find({},{"_id":0,"id":1,"name":1,"service.path":1,"icon":1}).toArray(function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.status(200).send(result);
                });
            };
        };
    });
});
app.get('/books', function (req, res) {
  mongoClient.connect(dbConfig.SysPath(), function (error, db) {
    if (error) res.status(500).send(error);
    else {
      result = [];
      db.collection('descriptors')
      .find({"service.referenceBook": true},{"_id":0})
      .map(function (element) {
        var compiledExtend = {};
        for (var prop in element.collection.bookRequest) {
            compiledExtend[prop] = element.compiled[element.collection.bookRequest[prop]];
        };
        return {
          id: element.id,
          name: element.name,
          compiledExtend: compiledExtend,
          request: element.collection.bookRequest,
          parameters: element.service.parameters,
          key: element.collection.key.id
        };
      })
      .toArray(function (error, result) {
        db.close();
        if (error) res.status(500).send(error);
        else res.status(200).send(result);
      });
    };
  });
});
app.post('/edit/descriptor', function (req, res) {
    var data = req.body;
    mongoClient.connect(dbConfig.SysPath(), function (error, db) {
        if (error)
            res.status(500).send(error);
        else {
            var collection = db.collection('descriptors');
            collection.update({"id": data.id}, data, {upsert: true}, function (dberror, result) {
                if (dberror)
                    res.status(500).send(dberror)
                else res.send(result);
                db.close();
            });
        };
    });
});
app.post('/remove/descriptor', function (req, res) {
    var data = req.body;
    if (data.id) {
        mongoClient.connect(dbConfig.SysPath(), function (error, db) {
            if (error)
                res.status(500).send(error);
            else {
                var collection = db.collection('descriptors');
                collection.remove({"id":data.id}, function (error, result) {
                    db.close();
                    if (error)
                        res.status(500).send(error);
                    else
                        res.status(200).send('ok');
                });
            };
        });
    }
    else {
        res.status(500).send("id required");
    };
});
app.post('/getDatasource', function(req, res) {
  var url = 'http://localhost:8030/live/data';
  if (req.query.book == 1) url = 'http://localhost:8030/live/book';
  // redirect
  var options = {
    url: url,
    method: 'POST',
    headers: {
      'Content-Type':'Content-Type: application/json;charset=utf-8'
    },
    form: req.body
  };
  request(options, function(error, response, body) {
    if (error) res.send(error);
    else res.send(body);
  });
});




// админка
app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname + '/adminConsole/front/index.html'));
});



// основное приложение
app.get('', function(req, res) {
  res.sendFile(path.join(__dirname + '/front/index.html'));
});




// app init
app.listen(port, function () {
	console.log('started on port '+port);
});

/*
var rcs0 = CacheServer.Start({
  "instance": "RCS_0",
  "port": 8010,
  "cache_type": "regular",
  "database": "mongodb://localhost:27017/dataCache",
  "snapshot_service": "http://localhost:8090/cache/regular",
  "descriptor_service": "http://localhost:8090/descriptor",
  "router": "http://localhost:8090"
});
var bcs0 = CacheServer.Start({
  "instance": "BCS_0",
  "port": 8020,
  "cache_type": "book",
  "database": "mongodb://localhost:27017/bookCache",
  "snapshot_service": "http://localhost:8090/cache/book",
  "descriptor_service": "http://localhost:8090/descriptor",
  "router": "http://localhost:8090"
});
*/
var ls0 = LiveServer.Start({
  "instance": "LS_0",
  "port": 8030,
  "descriptor_service": "http://localhost:8090/descriptor"
});

/*
var is0 = ImageServer.Start({
  "instance" : "IMGS_0",
  "port": 8040
});
*/
/*
var auth = AuthorizationServer.Start({
  "instance" : "AUTH",
  "port" : 8050,
  "database": "mongodb://localhost:27017/authorization",
  "apiEndpoints" : {
    "snapshots": "http://localhost:8090/snapshot"
  }
});
*/
