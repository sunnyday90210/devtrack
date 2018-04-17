const GoogleStrategy = require("passport-google-oauth20").Strategy;
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const keys = require("./keys");

// Load user model
const User = mongoose.model("users");
// Load UserPass model
const NewPass = mongoose.model('userspass');


module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.googleClientID,
        clientSecret: keys.googleClientSecret,
        callbackURL: "/auth/google/callback",
        proxy: true
      },
      (accessToken, refreshToken, profile, done) => {
        // console.log(accessToken);
        // console.log(profile);

        const image = profile.photos[0].value.substring(
          0,
          profile.photos[0].value.indexOf("?")
        );

        const newUser = {
          googleID: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          image: image
        };

        // Check for existing user
        User.findOne({
          googleID: profile.id
        }).then(user => {
          if (user) {
            // Return user
            done(null, user);
          } else {
            // Create user
            new User(newUser).save().then(user => done(null, user));
          }
        });
      }
    )

  );

  passport.use(new LocalStrategy ({usernameField: 'email'}, (email, password, done) => {
    // Match user registration
    NewPass.findOne({
      email: email
    }).then(user => {
      if(!user) {
        return done(null, false, {message: 'No user found'});
      }

        // Match Password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if(err) throw err;
          if(isMatch) {
            return done(null, user)
          } else {
            return done(null, false, {message: 'Password Incorrect '});
          }
        });


    });
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => done(null, user));
  });


  // passport.serializeUser(function (user, done) {
  //   done(null, user.id);
  // });

  // passport.deserializeUser(function (id, done) {
  //   NewPass.findById(id, function (err, user) {
  //     done(err, user);
  //   });
  // });



};
