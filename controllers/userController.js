var User = require('../models/user');
var Year = require('../models/year');
var Day = require('../models/day');
var utils = require('./dbUtils');

var async = require('async');
var bcrypt = require('bcrypt');
const _ = require('underscore');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.user_list = function(req, res, next) {
    User.find()
        .sort([[ 'username', 'ascending' ]])
        .exec(function (err, list_users) {
            if (err) { return next(err); }
            console.log(req.session)
            res.render('user_list', { title: 'Users', user_list: list_users })
        })
}

exports.user_detail = function(req, res, next) {
    async.waterfall([
        function(callback) {
            User.findById(req.params.id, {"password": 0})
                .populate({
                    path: 'years',
                    populate: { path: 'days' },
                })
                .exec(callback)
        },
        function(user, callback) {
            if (user == null) {
                var err = new Error('User not found');
                err.status = 404;
                return callback(err);
            }
            utils.verifySession(user.username, req.session, function(err, verified){
                callback(err, {'verified': verified, 'user': user});   
            })
        }
    ], function(err, results) {
        if (err) { return next(err); }
        if (results.verified) {
            res.render('user_detail', { title: `Mood Journal (${results.user.username})`, user: results.user, options: utils.defaultMoodOptions })
        } else {
            res.redirect('/login');
        }
    });
}

exports.user_create_get = function(req, res) {
    res.render('signup', { title: "Signup"});
}

exports.user_create_post = [
    body('username').isLength({ min: 1}).trim().withMessage('Username must be specified')
        .isAlphanumeric().withMessage('Username has non-alphanumeric characters.'),
    body('password').isLength({ min: 1}).withMessage('Password must be specified'),

    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').escape(),
    sanitizeBody('passwordAgain').escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('signup', { title: "Signup", user: req.body, errors: errors.array() });
            return;
        }

        // This can be refactored to use the ES7 await function to reduce depth. Still experimental though.
        // Alternatively, major refactoring with Promises and two catch statements
        User.findOne({'username': req.body.username}).exec(function(err, existingUser) {
            if (err) { return next(err); }
            if (existingUser) {
                var error = {"msg": "Username already exists."};
                return res.render('signup', {title: "Signup", errors: [error]});
            }
            if (req.body.password !== req.body.passwordAgain) {
                var error = {"msg": "Passwords do not match."};
                return res.render('signup', {title: "Signup", errors: [error], username: req.body.username});
            }
            utils.create_new_user(req.body.username, req.body.password, function(err, user) {
                if (err) { return next(err); }
                req.session.user = user.username;
                req.session.password = user.password;
                req.session.url = user.url;
                res.redirect(user.url);
            });
        })
    }
];

exports.user_update_post = function(req, res, next) {
    var curDate = new Date()
    User.findById(req.params.id)
    .populate({
        path: 'years',
        populate: { path: 'days' },
    })
    .exec(function(err, user) {
        if (err) { return next(err); }
        if (user == null) {
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        var year = user.years.find(function(el) {
             return el.year === curDate.getFullYear()
        })
        var curDay = year.days.find(function (el) {
            return el.date.getMonth() === curDate.getMonth() &&
                el.date.getDate() === curDate.getDate();
        })
        var newDay = new Day({
            mood: req.body.mood,
            date: curDay.date,
            _id: curDay._id
        })
        Day.findByIdAndUpdate(curDay._id, newDay, {}, function(err, day) {
           if (err) { return next(err) }
           res.redirect(user.url)
           //res.render('partials/mood_graph', {user: user, layout: false});
        });
        //res.render('user_detail', { title: 'User detail', user: results.user })
    });
};

exports.login_get = function (req, res) {
    res.render('login', { title: "Login" });
}

exports.user_login_post = [
    body('username').isLength({ min: 1}).trim().withMessage('Username must be specified').isAlphanumeric().withMessage('Username has non-alphanumeric characters.'),
    body('password').isLength({ min: 1}).withMessage('Password must be specified'),

    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('login', { title: "Login", user: req.body, errors: errors.array()});
            return;
        }
        User.findOne({'username': req.body.username})
        .exec(function(err, user) {
            if (err) { return next(err); }
            if (user == null) {
                var err = {"msg" : 'No user found with given username.'}
                res.render('login', {title: 'Login', errors: [err]});
                return
            }
            var hash = user.password;
            bcrypt.compare(req.body.password, hash, function(err, bcryptResult) {
                if (err) { return next(err) }
                if (!bcryptResult) {
                    var err = {"msg" : 'Incorrect password.'}
                    res.render('login', {title: 'Login', username: req.body.username, errors: [err]});
                    return
                }
                req.session.user = user.username;
                req.session.password = user.password;
                req.session.url = user.url;

                console.log(req.session)
                res.redirect(user.url)
            })
        })
    }
]

exports.user_logout_get = function(req, res) {
    req.session.destroy();
    res.redirect("/")
}

// Adds years to all users from their latest year to the current year
exports.update_user_years = function(){
    var curDate = new Date()
    var curYear = curDate.getFullYear();
    User.find()
    .populate({
        path: 'years',
        options: {sort: {'year': -1}},
    })
    .exec(function(err, users) {
        if (err) { console.log(err); return; }
        async.each(users, function(user, callback) {
            var userLatestYear = user.years[0].year;
            var years = _.range(userLatestYear + 1, curYear + 1);
            async.each(years, function(year, yearCallback) {
                utils.create_new_year(year, function(err, newYear) {
                    if (err) { return yearCallback(err); }
                    user.years.push(newYear);
                    yearCallback();
                })
            }, function(err) {
                if (err) { return callback(err); }
                user.save(callback);
            })

        }, function(err) {
            if (err) {
                console.log (err);
            } else {
                console.log ("All users updated");
            }
        })
    });
}

