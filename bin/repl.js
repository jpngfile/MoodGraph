var net = require("net");
var repl = require('repl');
var mongoose = require('mongoose');
var _ = require('underscore');
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

var echo = function(err, results) {
    if (err) { console.log(err) }
    else { console.log(results) }
}
shell.context.mongoose = mongoose;
shell.context.db = db;
shell.context._ = _;
shell.context.userController = userController;

