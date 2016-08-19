var express = require('express');
var cors = require('cors');
var mongodb = require('mongodb');
var bodyparser = require('body-parser');


var dataChunk = require('./records.json');

function pushDataIn (data) {
  mongoClient.connect('mongodb://localhost:27017/monitoringTest',function (error, db) {
    if (error) console.log(error);
    else {
      db.collection('records').insert(data.records, function (error, result) {
        db.close();
        if (error) console.log(error);
        else console.log(result);
      });
    };
  });
};



var app = express();
var mongoClient = mongodb.MongoClient;


app.listen(2000, function () {
  console.log("mini test service for monitoring");
  //pushDataIn(dataChunk);
});

app.use(cors());

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.get("/data", function (req, res) {
  var query = req.query;

  var request = {};
  if ((query.OIV) && ((query.OIV != undefined) || (query.OIV != ""))) request.OIV = query.OIV;

  if (query.shortService || query.priorityService || query.IEV) {

    request.$or = [];
    if (query.shortService == "True") request.$or.push({shortService : true});
    if (query.priorityService == "True") request.$or.push({priorityService : true});
    if (query.IEV == "True") request.$or.push({IEV : true});

    if (request.$or.length == 0) delete request.$or;

  };


  if (query.dateBegin || query.dateEnd) {
    request.date = {};
    if (query.dateBegin) request.date.$gte = new Date(query.dateBegin);
    if (query.dateEnd) request.date.$lt = new Date(query.dateEnd);
  };

  mongoClient.connect('mongodb://localhost:27017/monitoringTest',function (error, db) {
    if (error) res.status(500).send(error);
    else {
      var output = {};
      db.collection('records')
        .find(request,{"_id":0})
        .forEach(
          function (doc) {

            if (!output[doc.OIV]) output[doc.OIV] = {
              deliveredGreen : 0,
              deliveredYellow : 0,
              deliveredOrange : 0,
              deliveredRed : 0,
              processGreen : 0,
              processYellow : 0,
              processOrange : 0,
              processRed : 0,
              returnedGreen : 0,
              returnedYellow : 0,
              returnedOrange : 0,
              returnedRed : 0,
              green : 0,
              yellow : 0,
              orange : 0,
              red : 0
            };

            output[doc.OIV].deliveredGreen += doc.deliveredGreen;
            output[doc.OIV].deliveredYellow += doc.deliveredYellow;
            output[doc.OIV].deliveredOrange += doc.deliveredOrange;
            output[doc.OIV].deliveredRed += doc.deliveredRed;

            output[doc.OIV].processGreen += doc.processGreen;
            output[doc.OIV].processYellow += doc.processYellow;
            output[doc.OIV].processOrange += doc.processOrange;
            output[doc.OIV].processRed += doc.processRed;

            output[doc.OIV].returnedGreen += doc.returnedGreen;
            output[doc.OIV].returnedYellow += doc.returnedYellow;
            output[doc.OIV].returnedOrange += doc.returnedOrange;
            output[doc.OIV].returnedRed += doc.returnedRed;

            output[doc.OIV].green += doc.deliveredGreen + doc.processGreen + doc.returnedGreen;
            output[doc.OIV].yellow += doc.deliveredYellow + doc.processYellow + doc.returnedYellow;
            output[doc.OIV].orange +=doc.deliveredOrange + doc.processOrange + doc.returnedOrange;
            output[doc.OIV].red += doc.deliveredRed + doc.processRed + doc.returnedRed;

          },
          function (error) {
            db.close();
            if (error) res.status(500).send(error);
            else {
              var xml = "<records>";
              for (var element in output) {

                xml += "<element>"+
                "<OIV>"+element+"</OIV>"+
                  "<deliveredGreen>"+output[element].deliveredGreen+"</deliveredGreen>"+
                  "<deliveredYellow>"+output[element].deliveredYellow+"</deliveredYellow>"+
                  "<deliveredOrange>"+output[element].deliveredOrange+"</deliveredOrange>"+
                  "<deliveredRed>"+output[element].deliveredRed+"</deliveredRed>"+
                  "<processGreen>"+output[element].processGreen+"</processGreen>"+
                  "<processYellow>"+output[element].processYellow+"</processYellow>"+
                  "<processOrange>"+output[element].processOrange+"</processOrange>"+
                  "<processRed>"+output[element].processRed+"</processRed>"+
                  "<returnedGreen>"+output[element].returnedGreen+"</returnedGreen>"+
                  "<returnedYellow>"+output[element].returnedYellow+"</returnedYellow>"+
                  "<returnedOrange>"+output[element].returnedOrange+"</returnedOrange>"+
                  "<returnedRed>"+output[element].returnedRed+"</returnedRed>"+
                  "<green>"+output[element].green+"</green>"+
                  "<yellow>"+output[element].yellow+"</yellow>"+
                  "<orange>"+output[element].orange+"</orange>"+
                  "<red>"+output[element].red+"</red>"+
                "</element>";
              };
              xml += "</records>";
              res.header('Content-Type', 'application/xml').status(200).send(xml);
            };
          });
    };


  });


});
