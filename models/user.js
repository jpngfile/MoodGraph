var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, required: true, max: 100},
    password: {type: String, required: true, max 100},
});

UserSchema
.virtual('url')
.get(function () {
    reuturn '/users/' + this._id;
});

module.exports = mongoose.model('User', UserSchema);
