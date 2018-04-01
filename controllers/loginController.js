
exports.login_get = function (req, res) {
    res.render('login', { title: "Login", session: req.session });
}

exports.login_post = function (req, res) {
    res.send("Login not implemented")
}
