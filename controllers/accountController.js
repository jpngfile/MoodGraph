var User = require('../models/user');
const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.account_create_get = function(req, res) {
    res.render('signup', { title: "Signup"});
}

exports.account_create_post = [
    body('username').isLength({ min: 1}).trim().withMessage('Username must be specified').isAlphanumeric().withMessage('Username has non-alphanumeric characters.'),
    body('password').isLength({ min: 1}).withMessage('Password must be specified'),

    sanitizeBody('username').trim().escape(),
    sanitizeBody('password').escape(),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.render('signup', { title: "Signup", user: req.body, errors: errors.array() });
            return;
        } else {
            var user = new User({
                username: req.body.username,
                password: req.body.password,
                years: []
            });
            user.save(function (err) {
                if (err) { return next(err); }
                res.send("user created");
            })
        }
    }
];
