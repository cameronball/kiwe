exports.requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  else {
    return res.redirect('/login');
  }
}

exports.requireAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.admin) {
    return next();
  }
  else {
    return res.redirect('/login');
  }
}