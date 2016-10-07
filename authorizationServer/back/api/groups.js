server.post('/groupsList', function(req, res) {
    let data = req.body;
    if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        GetGroupsList()
        .then((result) => {res.status(200).send(result)})
        .catch((error) => {
            if (error) res.send(error);
            else res.status(401).send();
        });
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
});
server.post('/newGroup', function(req, res) {
    let data = req.body;
    if (data.group && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        EditGroup(data.group)
        .then((result) => {res.status(200).send("ok")})
        .catch((error) => {
            if (error) res.send(error);
            else res.status(401).send();
        });
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
});
server.post('/group', function(req, res) {
    let data = req.body;
    if (data.id && data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        GetGroup(data.id)
        .then((result) => {res.status(200).send(result)})
        .catch((error) => {
            if (error) res.send(error);
            else res.status(401).send();
        });
    }
    else res.status(400).send("<h1>400 Bad request</h1>");
});
