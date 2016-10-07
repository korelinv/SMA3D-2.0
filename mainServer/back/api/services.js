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
