var express = require('express');
var router = express.Router();

var account_controller = require('../controllers/accountController')
var login_controller = require('../controllers/loginController')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Mood Graph' });
});

// GET request for creating an account
router.get('/createAccount', account_controller.account_create_get)

// Get request for login
router.get('/login', login_controller.login_get)

module.exports = router;
