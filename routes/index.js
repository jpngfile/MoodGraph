var express = require('express');
var router = express.Router();

var account_controller = require('../controllers/accountController')
var login_controller = require('../controllers/loginController')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Mood Graph' });
});

// GET request for creating an account
router.get('/account/create', account_controller.account_create_get)

// POST request for creating an account
router.post('/account/create', account_controller.account_create_post)

// GET request for login
router.get('/login', login_controller.login_get)

// POST request for login
router.post('/login', login_controller.login_post)

module.exports = router;
