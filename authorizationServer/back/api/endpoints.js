server.post('/endpoints', function(req, res) {
    let data = req.body;
    if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        res.status(200).send(config.apiEndpoints)
    }
    else res.status(400).send("<h1>400 Bad request. Session key required.</h1>");
});
