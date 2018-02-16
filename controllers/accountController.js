
exports.account_create_get = function(req, res) {
    res.render('signup', { title: "Signup"});
}

exports.account_create_post = function(req, res) {
    res.send("Account creation not implemented")
}
