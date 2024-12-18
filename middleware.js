// Middleware function for pages requiring users to be logged in
exports.requireLogin = (req, res, next) => {
  // Check if the user session exists, and if the session has ser information as if they are logged out, both of these won't exist.
  if (req.session && req.session.user) {
    // Check if the user logged in has a banned account, and if they do redirect them to the banned page.
    if (req.session.user.banned) {
      return res.redirect('/banned');
    }
    // Check if the user has 2FA enabled and whether it has been verified yet.
    else if (req.session.user.twoFactorEnabled && !req.session.user.twoFactorVerified) {
      // If they haven't verified 2FA, redirect them to the page to do that.
      return res.redirect('/twofactor');
    }
    else {
      // If they don't meet any of the criteria prohibiting them from accessing their desired page, then redirect them there.
      return next();
    }
  }
  else {
    // If the user is not logged in, redirect them to the login page.
    return res.redirect('/login');
  }
}

// Middleware function for pages requiring users to be an admin
exports.requireAdmin = (req, res, next) => {
  // Check there is a session, that they are logged in and that they are an admin
  if (req.session && req.session.user && req.session.user.admin) {
    // If there are, redirect to desired page
    return next();
  }
  else {
    // If they aren't redirect to login page
    return res.redirect('/login');
  }
}
