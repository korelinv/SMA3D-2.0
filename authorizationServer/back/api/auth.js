server.post('/authenticate', function(req,res) {
    let data = req.body;
    if (data.login && data.password) {
      let hash = crypto.createHash('sha1').update(data.password).digest('hex');
      FindToken(data.login,hash)
      .then((result) => {
        LogAuthentication(req.ip,data.login,200)
        .then((result) => {
          let sessionKey = crypto.randomBytes(64).toString('Base64') + crypto.randomBytes(64).toString('Base64') + crypto.randomBytes(64).toString('Base64');
          sessions[sessionKey] = req.ip;
          res.status(200).send(sessionKey);
        })
        .catch((error) => {
            res.status(500).send(error);
        });
      })
      .catch((error) => {
        LogAuthentication(req.ip,data.login,401)
        .then((result) => {
            res.status(401).send();
        })
        .catch((error) => {
            res.status(500).send(error);
        });
      });
    }
    else {
      LogAuthentication(req.ip,null,400)
      .then((result) => {
          res.status(400).send("<h1>400 Bad request</h1>");
      })
      .catch((error) => {
          console.log(3);
          res.status(500).send(error);
      });
    };
});
server.post('/approve', function(req, res) {
    let data = req.body;
    if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
      res.status(200).send('ok');
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
});
server.post('/logout', function(req, res) {
    let data = req.body;
    if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
      delete sessions[data.session];
      res.status(200).send("ok");
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
});
