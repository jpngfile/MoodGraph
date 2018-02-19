var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var YearSchema = new Schema({
    days: { type: [{ type: String, enum: ['happy', 'sad', 'neutral', 'unassigned']}]}
});

module.exports = mongoose.model('Year', YearSchema);
