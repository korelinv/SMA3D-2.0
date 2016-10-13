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
