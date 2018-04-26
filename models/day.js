var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var DaySchema = new Schema({
    mood: { type: String, enum: ['happy', 'sad', 'neutral', 'unassigned']},
    date: { type: Date },
    note: { type: String }
});

module.exports = mongoose.model('Day', DaySchema)
