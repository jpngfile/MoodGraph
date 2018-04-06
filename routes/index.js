var express = require('express');
var router = express.Router();

var user_controller = require('../controllers/userController')
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Mood Journal' });
});

// GET request for creating a user
router.get('/user/create', user_controller.user_create_get)

// POST request for creating a user
router.post('/user/create', user_controller.user_create_post)

// GET request for one user
router.get('/user/:id', user_controller.user_detail);

// POST request for updating a user
router.post('/user/:id', user_controller.user_update_post)

// GET request to show all users
router.get('/users', user_controller.user_list)

// GET request for login
router.get('/login', user_controller.login_get)

// POST request for login
router.post('/login', user_controller.user_login_post)

// Get request for logout
router.get('/logout', user_controller.user_logout_get)

module.exports = router;
