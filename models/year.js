var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var YearSchema = new Schema({
    days: [{ type: Schema.ObjectId, ref: 'Day'}],
    year: {type: Number, default: Date.now.getFullYear}
});

module.exports = mongoose.model('Year', YearSchema);
