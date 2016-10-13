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
