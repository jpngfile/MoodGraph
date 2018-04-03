var User = require('../models/user');
var Year = require('../models/year');
var Day = require('../models/day');

var async = require('async');
var bcrypt = require('bcrypt');
const _ = require('underscore');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

const saltRounds = 10;

function verifySession(username, password, callback) {
    User.findOne({'username': username})
        .exec(function(err, user) {
            if (err) { return callback(err)}
            if (user == null) {
                return callback(null, false)
            }
            bcrypt.compare(password, user.password, function(err, res) {
                return callback(err, res)
            })
        })
}

exports.user_list = function(req, res, next) {
    User.find()
        .sort([[ 'username', 'ascending' ]])
        .exec(function (err, list_users) {
            if (err) { return next(err); }
            console.log(req.session)
            res.render('user_list', { title: 'Users', user_list: list_users, session: req.session })
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
            if (req.session == null ||
                req.session.user == null ||
                req.session.user !== user.username) {
                return res.redirect('/login');
            }
            verifySession(user.username, req.session.password, function(err, verified){
                callback(err, {'verified': verified, 'user': user});   
            })
        }
    ], function(err, results) {
        if (err) { return next(err); }
        if (results.verified) {
            res.render('user_detail', { user: results.user, session: req.session })
        } else {
            res.redirect('/login');
        }
    });
}

exports.user_create_get = function(req, res) {
    res.render('signup', { title: "Signup", session: req.session});
}

function create_new_year(year, finalCallback){
    var days = [];
    for (var i = 0; i < 365; i++){
        var date = new Date(year, 0, 1);
        date.setDate(date.getDate() + i)
        var day = new Day({
            mood: 'unassigned',
            date: date,
        });
        days.push(day);
    }
    async.each(days, function(day, callback) {
        day.save(function (err) {
            if (err) { return callback(err) }
            return callback()
        })
    }, function (err) {
        if (err) { return finalCallback(err);}
        var newYear = new Year({
            days: days,
            year: year,
        })
        newYear.save(finalCallback);
    });
}

exports.user_create_post = [
    body('username').isLength({ min: 1}).trim().withMessage('Username must be specified').isAlphanumeric().withMessage('Username has non-alphanumeric characters.'),
    body('password').isLength({ min: 1}).withMessage('Password must be specified'),

    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('signup', { title: "Signup", user: req.body, errors: errors.array(), session: req.session });
            return;
        }
        var currentYear = new Date().getFullYear();
        async.parallel({
            year: function(callback) {
                create_new_year(currentYear, callback) 
            },
            hash: function(callback) {
                bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                    if (err) { return callback(err); }
                    return callback(null, hash);
                })
            }
        }, function (err, results) {
            if (err) { return next(err) }
            var user = new User({
                username: req.body.username,
                password: results.hash,
                years: [results.year]
            });
            user.save(function (err) {
                if (err) { return next(err); }
                req.session.user = req.body.username;
                req.session.password = req.body.password;
                req.session.url = user.url;
                res.redirect(user.url);
            }) 
        });
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
        //console.log(user.years)
        var year = user.years.find(function(el) {
             return el.year === curDate.getFullYear()
        })
        //var curDay = year.days[0];
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

exports.user_login_post = [
    body('username').isLength({ min: 1}).trim().withMessage('Username must be specified').isAlphanumeric().withMessage('Username has non-alphanumeric characters.'),
    body('password').isLength({ min: 1}).withMessage('Password must be specified'),

    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('login', { title: "Login", user: req.body, errors: errors.array(), session: req.session});
            return;
        }
        User.findOne({'username': req.body.username})
        .exec(function(err, user) {
            if (err) { return next(err); }
            if (user == null) {
                //var err = new Error('No user found with given username and password');
                var err = {"msg" : 'No user found with given username.'}
                res.render('login', {title: 'Login', user: user, errors: [err], session: req.session});
                return
            }
            var hash = user.password;
            bcrypt.compare(req.body.password, hash, function(err, bcryptResult) {
                if (err) { return next(err) }
                if (!bcryptResult) {
                    var err = {"msg" : 'Incorrect password.'}
                    res.render('login', {title: 'Login', user: user, errors: [err], session: req.session});
                    return
                }
                req.session.user = req.body.username;
                req.session.password = req.body.password;
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
            // Create range of years
            var userLatestYear = user.years[0].year;
            var years = _.range(userLatestYear + 1, curYear + 1);
            async.each(years, function(year, yearCallback) {
                create_new_year(year, function(err, newYear) {
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

