// Минимальный прокси сервер для добавления CORS хэдеров ко всем запросам
//
//  API:
//    "/proxy" - GET метод с одним параметром url, в котором передается ссылка по которой находится содержимое
//    предполагается что сама ссылка будет экранирована, возможно будет работать и без экранирования, но подобное не тестировалось
//
//  Параметры конфиг файла:
//    instance - название сервера
//    port - порт для прослушивания
//
//  Пример использования:
//
//    var proxyServer = require('./app.js');
//    var example = proxyServer.Start({
//      "instance" : "Test Server",
//      "port": 3000
//    });
//
//  Примечание:
//    Сервер изначально задумывался для проксирования запросов к файлам,
//    при передаче страниц возможны проблемы с загрузкой ресурсов на этой странице

var express = require('express');
var cors = require('cors');
var q = require('q');
var bodyparser = require('body-parser');
var request = require('request');

var Server = function () {};
Server.prototype.Start = function (__config) {
  var app = express();
  app.locals.appConfig = __config;
  app.use(cors());
  app.use(bodyparser.urlencoded({ extended: true }));
  app.use(bodyparser.json());
  app.get("/proxy", function (req, res) {
    req.pipe(request(req.query.url))
    .on("error", (error) => {
      res.status(500).send("<h1>500 Internal server error</h1><br>"+error);
    })
    .pipe(res);
  });
  app.listen(app.locals.appConfig.port, function () {
    console.log("["+app.locals.appConfig.instance+"] >> started server on port "+app.locals.appConfig.port);
  });
  return app;
};
module.exports = new Server();
