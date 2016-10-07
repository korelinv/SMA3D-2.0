server.post('/logs', function(req, res) {
    let data = req.body;
    if (data.session && AuthenticationBySessionKey(data.session,req.ip)) {
        var period = {
            sdate : new Date(data.sdate),
            edate : new Date(data.edate)
        };
        GetAuthenticationLog(period)
        .then((result) => {
            res.status(200).send(result)
        })
        .catch((error) => {
            if (error) res.send(error);
            else res.status(401).send();
        });
      }
      else res.status(400).send("<h1>400 Bad request</h1>");
});
