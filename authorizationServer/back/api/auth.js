'use strict';
const crypto = require('crypto');

const auth = function(mongoClient, database, sessions) {

    const Auth = new (require('../common/auth'))(mongoClient,database,sessions);

    this.Authenticate = function(req,res) {
        let data = req.body;
        if (data.login && data.password) {
          let hash = crypto.createHash('sha1').update(data.password).digest('hex');
          Auth.FindToken(data.login,hash)
          .then((result) => {
            Auth.LogAuthentication(req.ip,data.login,200)
            .then((result) => {
              let sessionKey = crypto.randomBytes(64).toString('Base64') + crypto.randomBytes(64).toString('Base64') + crypto.randomBytes(64).toString('Base64');
              sessions[sessionKey] = req.ip;
              res.status(200).send(sessionKey);
            })
            .catch((error) => {res.status(500).send(error)});
          })
          .catch((error) => {
            Auth.LogAuthentication(req.ip,data.login,401)
            .then((result) => {res.status(401).send()})
            .catch((error) => {res.status(500).send(error)});
          });
        }
        else {
          Auth.LogAuthentication(req.ip,null,400)
          .then((result) => {res.status(400).send("<h1>400 Bad request</h1>")})
          .catch((error) => {res.status(500).send(error)});
        };
    };
    this.Approve = function(req, res) {
        let data = req.body;
        if (data.session && Auth.AuthenticationBySessionKey(data.session,req.ip)) {
          res.status(200).send('ok');
        }
        else res.status(400).send("<h1>400 Bad request</h1>");
    };
    this.Logout = function(req, res) {
        let data = req.body;
        if (data.session && Auth.AuthenticationBySessionKey(data.session,req.ip)) {
          delete sessions[data.session];
          res.status(200).send("ok");
        }
        else res.status(400).send("<h1>400 Bad request</h1>");
    };

};

module.exports = auth;
