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
