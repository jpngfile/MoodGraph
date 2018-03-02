var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var YearSchema = new Schema({
    days: [{ type: Schema.ObjectId, ref: 'Day'}],
    year: {type: Number, default: new Date().getFullYear()}
});

module.exports = mongoose.model('Year', YearSchema);
