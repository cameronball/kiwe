exports.requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    if (req.session.user.banned) {
      return res.redirect('/banned');
    }
    else if (req.session.user.twoFactorEnabled && !req.session.user.twoFactorVerified) {
      return res.redirect('/twofactor');
    }
    else {
      return next();
    }
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
