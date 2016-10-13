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
