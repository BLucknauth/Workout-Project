require('./db');
const dotenv = require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const Handlebars = require('hbs');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const passport = require('passport'), LocalStrategy = require('passport-local').Strategy;

// TODO: Create logout page
// TODO: Error handling for inputs

const sessionOptions = {
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
};

const app = express();
app.use(session(sessionOptions));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// body parser setup
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

Handlebars.registerHelper('displayDays', function(n) {
    // creates header row of days
    let accum = '<tr>';
    for(let i = 0; i < n; i++) {
        accum += `<th> Day ${i+1} </th>`;
    }
    accum +='</tr>';
    return accum;
});

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(
  function(username, password, done) {
    User.findOne({ username: username }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, {message: 'Incorrect username.'});
      } else {
        bcrypt.compare(password, user.password, (err, passwordMatch) => {
            if (err) {
                console.log(err);
                res.send('An error occured, please check the server output'); 
                return;
            } else if (!passwordMatch) {
                return done(null, false, {message:'Incorrect password.'});
            } else {
                return done(null, user);
            }
        });
      }
    });
  }
));

const User = mongoose.model('User');
// const Calendar = mongoose.model('Calendar');

app.get('/', (req, res) => {
    res.redirect('home');
});

app.get('/home', (req, res) => {
    // TODO: Have some pre-loaded calendars here
    res.render('index', {user: req.session.user || null});
});

app.get('/calendars', (req, res) => {
    // TODO: Make this render calendar!! 
    // TODO: This should also authenticate + not show calendars if not logged in
    res.render('calendars', {user: req.session.user || null});
});

app.get('/calendars/add', (req, res) => {
    // TODO: Need to make it work with authentication
    if (req.session.user) {
        res.render('add-calendars', {user: req.session.user});
    } else {
        res.render('add-calendars', {message: 'Must be logged in to add calendar.'})
    }
});

app.post('/calendars/add', (req, res) => {
    // TODO: Need to make it work with authentication
    const calendarObj = {
        calendarName: req.body.calendarName,
        days: req.body.days,
        videos: [],
    }

    // TODO: need to pass user to template in addition to calendar
    req.session.user.calendars.push(calendarObj);
    res.render('add-videos', calendarObj);
});

app.get('/calendars/add/video', (req, res) => {

});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), function (req, res) {
    req.session.regenerate((err) => {
        if (err) {
            console.log(err);
            res.render('register', {message: 'An error occurred, please try again'});
        } else {
            req.session.user = req.user;
            res.redirect('/home');
        }
    });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/logout', (req, res) => {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            res.send('An error occured, please check the server output');
        } else {
            res.redirect('/');
        }
    });
});

app.post('/register', (req, res) => {
    if (!req.body.password || req.body.password.length<8) {
        res.render('register', {message:'Password must be at least 8 characters!'});
    } else {
        User.findOne({username: req.body.username}, (err, result) => {
            if (err) {
                console.log(err);
                res.render('register', {message: '1. An error occurred, please try again'});
            } else if (result){
                res.render('register', {message: "Username taken, please try again."});
            } else {
                hashPassword(req.body.password).then(function(hashedPassword) {
                    new User({
                        username: req.body.username,
                        password: hashedPassword,
                        calendars: []
                    }).save(function(err, user) {
                        if (err) {
                            console.log(err);
                            res.render('register', {message: '2. An error occurred, please try again'});
                        } else {
                            req.session.regenerate((err) => {
                                if (err) {
                                    console.log(err);
                                    res.render('register', {message: '3. An error occurred, please try again'});
                                } else {
                                    req.session.user = user;
                                    res.redirect('/home');
                                }
                            });
                        }
                    })
                })
            }
        });
    }
});

function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
}

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

app.listen(process.env.PORT || 3000);