var User = require('../models/user');
var Year = require('../models/year');
var Day = require('../models/day');

var async = require('async');
var bcrypt = require('bcrypt');
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
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id, {"password": 0})
                .populate({
                    path: 'years',
                    populate: { path: 'days' },
                })
                .exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user == null) {
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        if (req.session == null || req.session.user == null || req.session.user !== results.user.username) {
            return res.redirect('/login');
        }
        verifySession(results.user.username, req.session.password, function(err, verified) {
            if (err) { return next(err) }
            if (verified) {
                res.render('user_detail', { user: results.user, session: req.session })
            } else {
                return next(err)
            }
        })
    });
}

exports.user_create_get = function(req, res) {
    res.render('signup', { title: "Signup", session: req.session});
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
        } else {
            var days = [];
            var initialDate = new Date();
            console.log(initialDate)
            for (var i = 0; i < 365; i++){
                var date = new Date(initialDate.getFullYear(), 0, 1);
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
                })
            }, function (err) {
                if (err) { return next(err) }
            });
            var year = new Year({
                days: days
            })
            async.parallel({
                year: function(callback) {
                    year.save(function (err) {
                        if (err) {
                            callback(err);
                            return;
                        }
                    })
                    return callback(null, year);
                },
                hash: function(callback) {
                    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
                        if (err) {
                            callback(err);
                            return
                        }
                        return callback(null, hash);
                    })
                }
            }, function (err, results) {
                console.log ("results: " + results);
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
                    console.log(req.session);
                    res.redirect('/users');
                }) 
            });
        }
    }
];

exports.user_update_post = function(req, res, next) {
    var curDate = new Date()
    async.parallel({
        user: function(callback) {
            User.findById(req.params.id)
                .populate({
                    path: 'years',
                    populate: { path: 'days' },
                })
                .exec(callback)
        }
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.user == null) {
            var err = new Error('User not found');
            err.status = 404;
            return next(err);
        }
        //console.log(results.user.years)
        var year = results.user.years.find(function(el) {
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
           res.redirect(results.user.url)
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
        } else {
            async.parallel({
                user: function(callback) {
                    User.findOne({'username': req.body.username})
                        .exec(callback)
                }
            }, function(err, results) {
                if (err) { return next(err); }
                if (results.user == null) {
                    //var err = new Error('No user found with given username and password');
                    var err = {"msg" : 'No user found with given username.'}
                    res.render('login', {title: 'Login', user: results.user, errors: [err], session: req.session});
                    return
                }
                var hash = results.user.password;
                bcrypt.compare(req.body.password, hash, function(err, bcryptResult) {
                    if (err) { return next(err) }
                    req.session.user = req.body.username;
                    req.session.password = req.body.password;
                    req.session.url = results.user.url;

                    console.log(req.session)
                    res.redirect(results.user.url)
                })
            })
        }
    }
]

exports.user_logout_get = function(req, res) {
    req.session.destroy();
    res.redirect("/")
}

exports.update_user_years = function(){
    var curDate = new Date()
    var curYear = curDate.getFullYear();
    async.parallel({
        users: function(callback) {
            User.find()
                .populate({
                    path: 'years',
                    sort: {'year': -1},
                })
                .exec(callback)
        }
    }, function(err, results) {
        if (err) { console.log(err); return; }
        async.each(results.users, function(user, callback) {
            console.log(user.username);
            // Create range of years
            var userLatestYear = user.years[0].year;

            // Create a new year object for each missing year for each user
            for (var year = userLatestYear; year <= curYear; year++){
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
                    })
                }, function (err) {
                    if (err) { return callback(err);}
                });
                var newYear = new Year({
                    days: days,
                    year: year,
                })
                newYear.save();
                user.years.push(newYear);
            }
            user.save(callback);
        })
    });
}











