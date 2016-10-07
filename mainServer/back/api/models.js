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
