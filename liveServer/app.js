var express = require('express');
var request = require('request');
var bodyparser = require('body-parser');
var querystring = require('querystring');
var parseString = require('xml2js').parseString;
var q = require('q');


var Server = function () {};

Server.prototype.Start = function (__config) {
  var app = express();

  app.locals.appConfig = null;

  if (__config) app.locals.appConfig = __config;


  function RequestDescriptor(__id) {
    var deferred = q.defer();
    var parameters = {
      "method": "GET",
      "url": app.locals.appConfig.descriptor_service+"?id="+__id,
      "headers": {
        "auth": "some"
      }
    };
    request.get(parameters, function (error, response, body) {
      if (error) deferred.reject(FormErrorStack(app.locals.appConfig.instance,RequestDescriptor,error));
      else if (response.statusCode != 200) deferred.reject(FormErrorStack(app.locals.appConfig.instance,RequestDescriptor,"response.statusCode=" + response.statusCode));
      else deferred.resolve(JSON.parse(body));
    });
    return deferred.promise;
  }

  function FormExtension(extensionList) {
    var deferred = q.defer();
    var __compressed = {};
    if (extensionList.length > 0) {
      var promises = [];
      extensionList.forEach(function (extension, index, array) {
        promises.push(RequestExtention(extension));
      });
      q.all(promises)
      .then((result) => {
        var final = [].concat.apply([],result);
        return DigestCollection(final, function (element) {
          if (!__compressed[element.key.book]) __compressed[element.key.book] = {};
          if (!__compressed[element.key.book][element.key.id]) __compressed[element.key.book][element.key.id] = {};
          __compressed[element.key.book][element.key.id][element.key.value] = element.value;
          return element;
        });

      })
      .then((result) => {deferred.resolve(__compressed)})
      .catch((error) => {deferred.reject(error)});
    }
    else deferred.resolve(__compressed);
    return deferred.promise;
  };

  function RequestExtention(__extension) {
    var deferred = q.defer();
    var options = {
        url: 'http://localhost:8090/getDatasource?book=1',
        method: 'POST',
        headers: {
            'Content-Type':'Content-Type: application/json;charset=utf-8'
        },
        form: {
          id: __extension.book,
          request: __extension.request,
          parameters: __extension.parameters
        }
    };
    request(options, function(error, response, body) {
      if (error) deferred.reject(error);
      else {
        deferred.resolve(JSON.parse(body));
      };
    });
    return deferred.promise;
  };

  function RequestRawCollection (__path) {
    var deferred = q.defer();
    var parameters = {
      "method": "GET",
      "url": __path
    };
    request.get(parameters, function (error, response, body) {
      if (error) deferred.reject(error);
      else if (response.headers['content-type']) {
        // !refactor сделать нормально определение типа контента
        if (response.headers['content-type'].search('application/xml') != -1) deferred.resolve(body);
        else if (response.headers['content-type'].search('application/json') != -1) {}
        else deferred.reject(FormErrorStack(app.locals.appConfig.instance,RequestRawCollection,"415 Unsupported media type"))
      }
      else deferred.reject(FormErrorStack(app.locals.appConfig.instance,RequestRawCollection,"406 Not acceptable"));
    });
    return deferred.promise;
  };

  function ParseCollection (__data) {
    var deferred = q.defer();
    parseString(__data, {explicitArray : false}, function (error, result) {
      if (error) deferred.reject(error);
      else deferred.resolve(result);
    });
    return deferred.promise;
  };

  function RegularAssembly (__collection, __descriptor, __request, __extend) {
      var deferred = q.defer();
      var head = GetObjectAttributeSync(__collection,__descriptor.collection.path);




      /*
      ************************************* !!! WARNING !!! **********************************
      ФИКС НУЖЕН ДЛЯ ТОГО КОГДА В XML ПРИХОДИТ ТОЛЬКО ОДНА ЗАПИСЬ
      ТЕКУЩИЙ ПАРСЕР ПОНИМАЕТ ЕЕ КАК ОБЪЕКТ А НЕ КАК МАССИВ (ЧТО ЛОГИЧНО)
      ПОЭТОМУ РУКАМИ ЕЕ ПРЕОБРАЗОВЫВАЕМ В МАССИВ

      ПОТЕНЦИАЛЬНО ПРОБЛЕМНЫЙ ФИКС НУЖНО ПРИКРУТИТЬ БОЛЕЕ УДОБНЫЙ ПАРСЕР ИЛИ ОТКАЗАТЬСЯ ОТ XML
      ************************************* !!! WARNING !!! **********************************
      */
      if (!Array.isArray(head) && head) {
        var transform = [];
        transform.push(head);
        head = transform;
      };




      if (!head) {
        deferred.resolve([]);
      }
      else {

        DigestCollection(head,function (element) {
            var extendedData = {};
            if (__descriptor.extension) {
              __descriptor.extension.forEach(function (extension, index, array) {
                var book = extension.book;
                var key = extension.key;
                var value = GetObjectAttributeSync(element,__descriptor.compiled[extension.id].path);
                // <refactor>
                if (__extend[book]) {
                  if (__extend[book][key]) {
                    if (__extend[book][key][value]) {
                      for (var field in __extend[book][key][value]) {
                        extendedData[field] = __extend[book][key][value][field];
                      };
                    };
                  };
                };
                // </refactor>
              });
            };
            var resultingElement = {};
            resultingElement.data = {};
            for (var item in __request.request) {
                //null check
                if (__request.request[item]) {
                  // native check
                  if (__descriptor.compiled[__request.request[item]]) {
                    resultingElement.data[item] = {
                        value: GetObjectAttributeSync(element,__descriptor.compiled[__request.request[item]].path),
                        type: __descriptor.compiled[__request.request[item]].type,
                        __type: "SMA.system.TypedData"
                    };
                  };
                  // extended check
                  if (extendedData[__request.request[item]]) {
                    resultingElement.data[item] = extendedData[__request.request[item]];
                  };
                };
            };
            resultingElement.__type = "SMA.system.PoolElement";
            return resultingElement;
        })
        .then((result) => {
          deferred.resolve(result)
        })
        .catch((error) => {deferred.reject(error)});

      };

      return deferred.promise;
  };

  function BookAssembly (__collection, __descriptor) {
    var deferred = q.defer();
    var head = GetObjectAttributeSync(__collection,__descriptor.collection.path);
    DigestCollection(head,function (element) {
      var resultingElement = {};
      var wrap = {};
      wrap.key = {
        book: __descriptor.id,
        id: __descriptor.collection.key.id,
        value: GetObjectAttributeSync(element,__descriptor.collection.key.path)
      };
      for (var item in __descriptor.collection.bookRequest) {
          resultingElement[item] = {
              value: GetObjectAttributeSync(element,__descriptor.compiled[__descriptor.collection.bookRequest[item]].path),
              type: __descriptor.compiled[__descriptor.collection.bookRequest[item]].type,
              __type: "SMA.system.TypedData"
          };
      };
      wrap.value = resultingElement;
      return wrap;
    })
    .then((result) => {deferred.resolve(result)})
    .catch((error) => {deferred.reject(error)});
    return deferred.promise;
  };

  function DigestCollection(collection, action) {
    var deferred = q.defer();
    var out = [];
    if (collection.length > 0) IterateOut(collection,0,action, out, function (result) {deferred.resolve(result)});
    else deferred.resolve([]);
    return deferred.promise;
  };

  function IterateOut(collection,pointer,syncAction,result,callback) {
    result.push(syncAction(collection[pointer]));
    if (collection[pointer + 1] != undefined) {
      process.nextTick(function () {
        pointer++;
        IterateOut(collection,pointer,syncAction,result,callback);
      });
    }
    else process.nextTick(function () {callback(result)});
  };

  function GetObjectAttributeSync(object, path) {
    var result = object;
    for (var index = 0; index < path.length; index++) {
      if (result[path[index]] != undefined) result = result[path[index]];
      else {
        result = undefined;
        break;
      };
    };
    return result;
  };

  function CreateMethodCallMessage (__instance, __method) {
    return {
      instance: __instance,
      method: __method.name
    };
  };
  function CreateErrorMessage (__instance, __method, __details) {
    return {
      instance: __instance,
      method: __method.name,
      details: __details
    };
  }
  function FormErrorStack (__instance, __method, __details) {
    return [CreateErrorMessage(__instance, __method, __details)];
  };
  function AppendErrorStack (__error,__instance, __method) {
    __error.push(CreateMethodCallMessage(__instance, __method));
    return __error;
  };


  // midleware
  // request parsing
  app.use(bodyparser.urlencoded({ extended: true }));
  app.use(bodyparser.json());

  app.post("/live/:type", function (req, res) {
    var __type = req.params.type;
    var __request = req.body;

    if (__request && __type) {
      var __descriptor;
      var __raw;
      var __extend;
      RequestDescriptor(__request.id)
      .then((result) => {
        __descriptor = result;
        return FormExtension(__descriptor.extension);
      })
      .then((result) => {
        __extend = result;
        var requestUrl = querystring.stringify(__request.parameters,null,null);
        if (requestUrl.length > 0) requestUrl = __descriptor.service.path + '?' + requestUrl;
        else requestUrl = __descriptor.service.path;
        return RequestRawCollection(requestUrl);
      })
      .then(ParseCollection)
      .then((result) => {
        if (__type == "data") return RegularAssembly(result,__descriptor,__request,__extend);
        else if (__type == "book") return BookAssembly(result,__descriptor);
      })
      .then((result) => {
        res.status(200).send(result);
      })
      .catch((error) => {
        AppendErrorStack(error,app.locals.appConfig.instance,app.post);
        console.log(error);
        res.status(500).send("<h1>500 Internal server error</h1>");
      });
    }
    else res.status(400).send("<h1>400 Bad request</h1>");

  });

  app.listen(app.locals.appConfig.port, function () {
    console.log("["+app.locals.appConfig.instance+"] >> started live server on port "+app.locals.appConfig.port);
  });

  return app;
};

module.exports = new Server();
