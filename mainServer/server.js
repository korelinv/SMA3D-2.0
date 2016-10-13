'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const mongodb = require('mongodb');
const bodyparser = require('body-parser');
const guid = require('uuid-lib');
const querystring = require('querystring');
const request = require('request');
const q = require('q');

const wrapper = function() {
const server = express();
const router = express.Router();
const mongoClient = mongodb.MongoClient;
const config = require('./config.json');

server.use(cors());
server.use(bodyparser.urlencoded({ extended: true }));
server.use(bodyparser.json());
server.use(router);
server.use(express.static(path.join(__dirname, '/front/public')));
server.use(express.static(path.join(__dirname, '/adminConsole/front/public')));

server.get('/admin', function(req, res) {
    res.sendFile(path.join(__dirname + '/adminConsole/front/index.html'));
});

server.get('', function(req, res) {
    res.sendFile(path.join(__dirname + '/front/index.html'));
});

server.listen(config.port, function () {
    console.log('Main server started on port '+config.port);
});

server.get('/books', function (req, res) {
    mongoClient.connect(config.database, function (error, db) {
        if (error) res.status(500).send(error);
        else {
            result = [];
            db.collection('descriptors')
            .find({"service.referenceBook": true},{"_id":0})
            .map(function (element) {
              let compiledExtend = {};
              for (let prop in element.collection.bookRequest) {
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

server.get('/descriptors',function (req,res) {
    let id = req.query.id;
    if (id) {
        mongoClient.connect(config.database, function (error, db) {
            if (error) res.status(500).send(error);
            else {
                db.collection('descriptorsLegacy').findOne({"id":id},{"_id":0}, function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else {
                        if (result != null) res.send(result.data);
                        else res.send();
                    };
                });
            }
        });
    }
    else res.status(500).send("id required");
});
server.get('/descriptor', function (req, res) {
    let data = req.query;
    mongoClient.connect(config.database, function (error, db) {
        if (error) res.status(500).send(error);
        else {
            if (data.id) {
                colledb.collection('descriptors').findOne({"id":data.id},{"_id":0}, function(error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else if (!result) res.status(404).send("<h1>404 Not found</h1>");
                    else res.status(200).send(result);
                });
            }
            else {
                collectidb.collection('descriptors').find({},{"_id":0,"id":1,"name":1,"service.path":1,"icon":1}).toArray(function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.status(200).send(result);
                });
            };
        };
    });
});
server.post('/edit/descriptor', function (req, res) {
    let data = req.body;
    mongoClient.connect(config.database, function (error, db) {
        if (error) res.status(500).send(error);
        else {
            db.collection('descriptors').update({"id": data.id}, data, {upsert: true}, function (dberror, result) {
                if (dberror) res.status(500).send(dberror)
                else res.send(result);
                db.close();
            });
        };
    });
});
server.post('/remove/descriptor', function (req, res) {
    let data = req.body;
    if (data.id) {
        mongoClient.connect(config.database, function (error, db) {
            if (error) res.status(500).send(error);
            else {
                db.collection('descriptors').remove({"id":data.id}, function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.status(200).send('ok');
                });
            };
        });
    }
    else res.status(500).send("id required");
});

server.get('/models', function (req,res) {
    mongoClient.connect(config.database, function (error, db) {
        if (error) res.status(500).send(error);
        else {
            let collection = db.collection('modelsLegacy');
            collection.find({},{"_id":0}).toArray(function (error, result) {
                db.close();
                if (error) res.status(500).send(error);
                else res.send(result);
            });
        };
    });
});
server.post('/models/:mode', function(req, res) {
    let mode = req.params.mode;
    let data = req.body;
    switch (mode) {
        case "edit":
            mongoClient.connect(config.database, function(error, db) {
                if (error) res.status(500).send(error);
                else {
                    db.collection('modelsLegacy').update({id: data.id},{$set: data},{upsert: true}, function (error, result) {
                        if (error) res.status(500).send(error);
                        else res.status(200).send("ok");
                    });
                };
            });
            break;
        case "delete":
            mongoClient.connect(config.database,function(error, db) {
                if (error) res.status(500).send(error);
                else {
                    db.collection('modelsLegacy').remove({id: data.id}, function(error, result) {
                        if (error) res.status(500).send(error);
                        else res.status(200).send("ok");
                    });
                };
            });
            break;
        default:
            res.status(501).send("not implemented");
            break;
    };
});

server.get('/service', function (req,res) {
    let id = req.query.id;
    mongoClient.connect(config.database, function (error, db) {
        if (error) res.status(500).send(error);
        else {
            if (!id) {
                db.collection('servicesLegacy').find({},{"_id":0}).toArray(function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.send(result);
                });
            }
            else {
                db.collection('servicesLegacy').findOne({"id":id},{"_id":0}, function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.send(result);
                });
            };
        };
    });
});
server.post('/edit/service', function (req,res) {
    let data = req.body;
    if (data.id) {
        mongoClient.connect(config.database, function (error, db) {
            if (error) res.status(500).send(error);
            else {
                db.collection('servicesLegacy').findAndModify({"id":data.id},[],{$set: data},{upsert: true}, function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.status(200).send("ok");
                });
            };
        });
    }
    else res.status(500).send("id required");
});
server.post('/remove/service', function (req,res) {
    let data = req.body;
    if (data.id) {
        mongoClient.connect(config.database, function (error, db) {
            if (error) res.status(500).send(error);
            else {
                db.collection('servicesLegacy').remove({"id":data.id}, function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.status(200).send("ok");
                });
            };
        });
    }
    else res.status(500).send("id required");
});

server.get('/snapshot', function (req,res) {
    let request = req.query;
    mongoClient.connect(config.database, function (error, db) {
        if (error) res.status(500).send(error);
        else {
            if (request.all == "true") {
                db.collection('snapshotsLegacy').find({},
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
                    if (error) res.status(500).send(error);
                    else res.send(result);
                });
            }
            else if (request.id) {
                db.collection('snapshotsLegacy').findOne({"id":request.id},{"_id":0}, function(error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.send(result);
                });
            }
            else res.send({});
        };
    });
});
server.get('/snapshot/depended', function (req, res) {
    let data = req.query;
    if (data.id) {
        mongoClient.connect(config.database, function (error, db) {
            if (error) res.status(500).send(error);
            else {
                db.collection('snapshotsLegacy').find({children: {$elemMatch: {id:data.id}}}).toArray(function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.status(200).send(result);
                });
            };
        });
    }
    else res.status(500).send("id required");
});
server.post('/remove/snapshot', function (req,res) {
    let data = req.body;
    if (data.id) {
        mongoClient.connect(config.database, function (error, db) {
            if (error) res.status(500).send(error);
            else {
                db.collection('snapshotsLegacy').remove({"id":data.id}, function (error, result) {
                    if (error) {
                        db.close();
                        res.status(500).send(error);
                    }
                    else {
                        db.collection('snapshotsLegacy').update({},{$pull: {children: {id: data.id}}},{multi: true}, function (error, result) {
                            db.close();
                            if (error) res.status(500).send(error);
                            else res.status(200).send("ok");
                        });
                    };
                });
            };
        });
    }
    else res.status(500).send("id required");
});
server.post('/edit/snapshot', function (req,res) {
    let data = req.body;
    if (data.id) {
        mongoClient.connect(config.database, function (error, db) {
            if (error) res.status(500).send(error);
            else {
                db.collection('snapshotsLegacy').findAndModify({"id":data.id},[],{$set: data},{upsert: true}, function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.status(200).send("ok");
                });
            };
        });
    }
    else res.status(500).send("id required");
});
server.post('/edit/snapshot/addChildren', function (req,res) {
    let data = req.body;
    if (data.id) {
        mongoClient.connect(config.database, function (error, db) {
            if (error) res.status(500).send(error);
            else {
                db.collection('snapshotsLegacy').update({"id":data.id},{$addToSet: {children: {$each: data.children}}}, function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.status(200).send("ok");
                });
            };
        });
    }
    else res.status(500).send("id required");
});
server.post('/edit/snapshot/removeChild', function (req,res) {
    let data = req.body;
    if (data.id) {
        mongoClient.connect(config.database, function (error, db) {
            if (error) res.status(500).send(error);
            else {
                db.collection('snapshotsLegacy').update({"id":data.id},{$pull: {children: {id: data.child}}}, function (error, result) {
                    db.close();
                    if (error) res.status(500).send(error);
                    else res.status(200).send("ok");
                });
            };
        });
    }
    else res.status(500).send("id required");
});

server.post('/sconfig', function(req, res) {
    let data = req.body;
    mongoClient.connect(config.database, function (error, db) {
        if (error) res.status(500).send(error);
        else {
            db.collection('sourcePaths').findOne({id:data.role},{_id:0},function (error, result) {
                db.close();
                if (error) res.status(500).send(error);
                else res.send(result);
            });
        };
    });
});
server.get('/getUuid', function (req, res) {
    let quantity = req.query.q;
    if ((quantity == 1) || (quantity == undefined)) res.send(guid.raw());
    else if (quantity > 1) {
        if (quantity > 10)
            quantity = 10;
        let result = [];
        for (let i = 0; i < quantity; i++) {
            result.push(guid.raw());
        };
        res.send(result);
    }
    else res.send("ivalid quantity");
});
server.get('/cache/:type', function (req, res) {
  let headers = req.headers;
  let type = req.params.type;
  if (headers.auth) {
      mongoClient.connect(config.database, function(error, db) {
          if (error) res.status(500).send(error);
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
  else res.status(403).send("<h1>403 Forbidden<h1>");
});
server.post('/getDatasource', function(req, res) {
  let url = 'http://localhost:8030/live/data';
  if (req.query.book == 1) url = 'http://localhost:8030/live/book';
  // redirect
  let options = {
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
};

module.exports = new wrapper();