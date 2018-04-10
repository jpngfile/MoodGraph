var User = require('../models/user');
var Year = require('../models/year');
var Day = require('../models/day');

var async = require('async');
var bcrypt = require('bcrypt');
const _ = require('underscore');

const saltRounds = 10;

class MoodOption {
    constructor(mood, color, imagePath) {
        this.mood = mood;
        this.color = color;
        this.imagePath = imagePath;
    }

    get label() {
        return this.mood.charAt(0).toUpperCase() + this.mood.slice(1);
    }
}

exports.defaultMoodOptions = [
    new MoodOption('happy', '#FFE548', '/images/happyIcon.png'),
    new MoodOption('sad', '#8EB1C7', '/images/sadIcon.png'),
    new MoodOption('neutral', '#E5F3BB', '/images/neutralIcon.png'),
    new MoodOption('frustrated', '#DF2935', '/images/frustratedIcon.png'),
    new MoodOption('excited', '#AFA2FF', '/images/excitedIcon.png'),
    new MoodOption('productive', '#000000', '/images/productiveIcon.png'),
];

exports.verifySession = function(username, session, callback) {
    if (session == null ||
        session.user == null ||
        session.user !== username) {
        return callback(null, false);
    }
    User.findOne({'username': username})
        .exec(function(err, user) {
            if (err) { return callback(err)}
            if (user == null) {
                return callback(null, false)
            }
            var verified = user.password == session.password;
            return callback(null, verified);
        })
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
exports.create_new_year = create_new_year;

exports.create_new_user = function(username, password, callback) {
    var currentYear = new Date().getFullYear();
    async.parallel({
        year: function(callback) {
            create_new_year(currentYear, callback) 
        },
        hash: function(callback) {
            bcrypt.hash(password, saltRounds, function(err, hash) {
                if (err) { return callback(err); }
                return callback(null, hash);
            })
        }
    }, function (err, results) {
        if (err) { return callback(err) }
        var user = new User({
            username: username,
            password: results.hash,
            years: [results.year]
        });
        user.save(callback) 
    });
}
