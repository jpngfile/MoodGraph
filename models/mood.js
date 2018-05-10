var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var MoodSchema = new Schema({
    mood: {type: String, required: true, max: 100},
    color: {type: String, required: true},
    imagePath: {type: String}
})

module.exports = mongoose.model('Mood', MoodSchema);
