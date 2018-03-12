var net = require("net");
var repl = require('repl');
var mongoose = require('mongoose');
//connections = 0;
//
//net.createServer(function (socket) {
//    connections += 1;
//    repl.start("Node via TCP socket", socket);
//}).listen(3000);
var mongoDB = 'mongodb://localhost/test'
mongoose.connect(mongoDB, {});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var userController = require('./controllers/userController');
var shell = repl.start("node>");
shell.context.mongoose = mongoose;
shell.context.db = db;
shell.context.userController = userController;

