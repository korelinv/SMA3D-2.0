const config = require('./config.json');
const server = express();
const router = express.Router();
const sessions = {};
const mongoClient = mongodb.MongoClient;

server.use(cors());
server.use(bodyparser.urlencoded({extended: true}));
server.use(bodyparser.json());
server.use(router);
server.use(express.static(path.join(__dirname, '/front/public')));

server.get('', function(req, res) {
  res.sendFile(path.join(__dirname + '/front/index.html'));
});

server.listen(config.port, function () {
  console.log("["+config.instance+"] >> started server on port "+config.port);
});
