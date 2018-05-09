var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, unique: true, required: true, max: 100},
    password: {type: String, required: true, max: 100},
    years: [{ type: Schema.ObjectId, ref: 'Year' }],
    moods: [{ type: Schema.ObjectId, ref: 'Mood' }],
    created: {type: Date, default: Date.now()},
});

UserSchema
.virtual('url')
.get(function () {
    return '/user/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);
