const passport = require('passport');
const FBStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const settings = require('../secrets');

passport.use(new FBStrategy({
    clientID: settings.FBOAuth2.AppId,
    clientSecret: settings.FBOAuth2.secret,
    callbackURL: settings.FBOAuth2.callbackURL,
    profileFields: ['id', 'displayName',  'photos', 'emails']  
  },
  function(accessToken, refreshToken, profile, cb) {    
    console.log("Sei dentro!");
    return cb(null, profile);
  }
));


passport.use(new GoogleStrategy({
    clientID: settings.GOOAuth2.AppId,
    clientSecret: settings.GOOAuth2.secret,
    callbackURL: settings.GOOAuth2.callbackURL,
    profileFields: ['id', 'displayName', 'photos', 'emails']    
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
  }
));

passport.use(new LocalStrategy(
  function(username, password, done) {
    console.log("username : "+username)
    console.log("password : "+password)
    
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) { return done(null, false); }
      if (!user.verifyPassword(password)) { return done(null, false); }

      return done(null, user);
    });
  }
));