server.post('/userInfo', function(req,res) {
    let data = req.body;
    if (data.login && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
      GetUserInfo(data.login)
      .then((result) => {res.status(200).send(result)})
      .catch((error) => {
        if (error) res.send(error);
        else res.status(401).send();
      });
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
});
server.post('/newUser', function(req,res) {
    let data = req.body;
    if (data.user && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
      CreateNewUser(data.user)
      .then((result) => {res.status(200).send("ok")})
      .catch((error) => {
        if (error) res.send(error);
        else res.status(401).send();
      });
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
});
server.post('/editUser', function(req,res) {
    let data = req.body;
    if (data.user && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
      EditUser(data.user)
      .then((result) => {res.status(200).send("ok")})
      .catch((error) => {
        if (error) res.send(error);
        else res.status(401).send();
      });
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
});
server.post('/deleteUser', function(req,res) {
    let data = req.body;
    if (data.login && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
      DeleteUser(data.login)
      .then((result) => {res.status(200).send("ok")})
      .catch((error) => {
        if (error) res.send(error);
        else res.status(401).send();
      });
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
});
server.post('/usersList', function(req,res) {
    let data = req.body;
    if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
      GetUsersList()
      .then((result) => {res.status(200).send(result)})
      .catch((error) => {
        if (error) res.send(error);
        else res.status(401).send();
      });
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
});
