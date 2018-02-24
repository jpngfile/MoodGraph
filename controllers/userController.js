var User = require('../models/user');
var Year = require('../models/year');
var async = require('async');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.user_list = function(req, res) {
    
    User.find()
        .sort([[ 'username', 'ascending' ]])
        .exec(function (err, list_users) {
            if (err) { return next(err); }
            res.render('user_list', { title: 'Users', user_list: list_users })
        })
}

exports.user_detail = function(req, res) {
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id)
                .exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user == null) {
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        res.render('user_detail', { title: 'User detail', user: results.user })
    });
}

exports.user_create_get = function(req, res) {
    res.render('signup', { title: "Signup"});
}

exports.user_create_post = [
    body('username').isLength({ min: 1}).trim().withMessage('Username must be specified').isAlphanumeric().withMessage('Username has non-alphanumeric characters.'),
    body('password').isLength({ min: 1}).withMessage('Password must be specified'),

    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('signup', { title: "Signup", user: req.body, errors: errors.array() });
            return;
        } else {
            var year = new Year({
                days: Array(365).fill('unassigned')
            })
            var user = new User({
                username: req.body.username,
                password: req.body.password,
                years: [year]
            });
            year.save(function (err) {
                if (err) { return next(err); }
            })
            user.save(function (err) {
                if (err) { return next(err); }
                res.redirect('/users');
            })
        }
    }
];
