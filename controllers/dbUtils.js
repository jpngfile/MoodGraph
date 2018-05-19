var User = require('../models/user');
var Year = require('../models/year');
var Day = require('../models/day');
var Mood = require('../models/mood');

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
    new MoodOption('happy', '#FFE548', '/images/moodIcons/happyIcon.png'),
    new MoodOption('sad', '#8EB1C7', '/images/moodIcons/sadIcon.png'),
    new MoodOption('neutral', '#E5F3BB', '/images/moodIcons/neutralIcon.png'),
    new MoodOption('frustrated', '#DF2935', '/images/moodIcons/frustratedIcon.png'),
    new MoodOption('excited', '#AFA2FF', '/images/moodIcons/excitedIcon.png'),
    new MoodOption('productive', '#000000', '/images/moodIcons/productiveIcon.png'),
];

exports.defaultColors = [
    "#F59Fb8", // Pixie
    "#E690A8", // Cotton Candy
    "#EC8086", // Smoothie
    "#D4687E", // Hollyhock
    "#B85067", // Pomegranate
    "#B24F60", // Ruby 
    "#E75B57", // Poppy
    "#B84543", // Cranberry
    "#F49580", // Sorbet
    "#EE825A", // Sunset
    "#D98E4D", // Goldrush 
    "#DEAC49", // Saffron
    "#F5CD6D", // Canary 
    "#FFCD2A", // Honey 
    "#D3C28A", // Flaxen 
    "#C2CB93", // Sweet Leaf 
    "#9E9E4F", // Fern 
    "#AAD272", // Pear 
    "#708C4C", // Topiary 
    "#636E4D", // New England Ivy
    "#88B6AD", // Juniper
    "#9DCDCD", // Glacier 
    "#48B9B6", // Lagoon 
    "#226774", // Peacock
    "#84BCD5", // Crystal Blue 
    "#30789D", // Pacifica
    "#3B5281", // Sapphire
    "#B865AB", // Thistle
    "#8F7CB2", // Gypsy 
    "#895775", // Eggplant
    "#F4EDDA", // Colonial White
    "#D8C7A9", // Bamboo
    "#E6D1B8", // Champagne
    "#D0D1B8", // Cashmere
    "#A58869", // Desert Sand
    "#B1816C", // Saddle
    "#896859", // Chocolate
    "#756857", // Cocoa
    "#C0B9B4", // Whisper
    "#9A918D", // Slate
];

function create_default_moods(finalCallback){
    var moods = [];
    for (var i = 0; i < defaultMoodOptions.length; i++){
        moodOption = defaultMoodOptions[i];
        var mood = new Mood({
            mood: moodOption.mood,
            color: moodOption.color,
            imagePath: moodOption.imagePath,
        })
        moods.push(mood);
    }
    async.each(moods, function(mood, callback) {
        mood.save(function(err) {
            if (err) { return callback(err) }
            return callback()
        })
    }, finalCallback);
}

exports.create_default_moods = create_default_moods;

exports.verifySession = function(req, session, callback) {
    if (session == null ||
        session.user == null) {
        return callback(null, {'verified': false});
    }
    async.waterfall([
        function(callback) {
            User.findById(req.params.id)
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
            } else if (user.username !== session.user) {
                return callback(null, {'verified': false})
            }
            var verified = user.password == session.password;
            user.password = undefined;
            console.log("password: " + user.password)
            callback(null, {'verified': verified, 'user': user});   
        }
    ], callback)
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
