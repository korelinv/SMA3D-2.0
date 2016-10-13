const server = express();
const router = express.Router();
const mongoClient = mongodb.MongoClient;
const config = require('./config.json');

server.use(cors());
server.use(bodyparser.urlencoded({ extended: true }));
server.use(bodyparser.json());
server.use(router);
server.use(express.static(path.join(__dirname, '/front/public')));
server.use(express.static(path.join(__dirname, '/adminConsole/front/public')));

server.get('/admin', function(req, res) {
    res.sendFile(path.join(__dirname + '/adminConsole/front/index.html'));
});

server.get('', function(req, res) {
    res.sendFile(path.join(__dirname + '/front/index.html'));
});

server.listen(config.port, function () {
    console.log('Main server started on port '+config.port);
});
