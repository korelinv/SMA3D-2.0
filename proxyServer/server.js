'use strict';

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
//  Примечание:
//    Сервер изначально задумывался для проксирования запросов к файлам,
//    при передаче страниц возможны проблемы с загрузкой ресурсов на этой странице

const express = require('express');
const cors = require('cors');
const q = require('q');
const bodyparser = require('body-parser');
const request = require('request');
const config = require('./config.json');

const wrapper = function() {

    const server = express();

    server.use(cors());
    server.use(bodyparser.urlencoded({ extended: true }));
    server.use(bodyparser.json());

    server.listen(config.port, function () {
        console.log('proxy server started successfully');
    });

    server.get("/proxy", function (req, res) {
        req.pipe(request(req.query.url))
        .on("error", (error) => {
            res.status(500).send("<h1>500 Internal server error</h1><br>" + error);
        })
        .pipe(res);
    });

};

module.eports = new wrapper();
