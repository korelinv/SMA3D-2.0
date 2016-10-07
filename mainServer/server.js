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

server.get('', function(req, res) {
    res.sendFile(path.join(__dirname + '/front/index.html'));
});

server.listen(config.port, function () {
    console.log('Main server started on port '+port);
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

}

module.exports = new wrapper();