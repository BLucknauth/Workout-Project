require('./db');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const Handlebars = require('hbs');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// TODO: Create logout page

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

const User = mongoose.model('User');
// const Calendar = mongoose.model('Calendar');

app.get('/', (req, res) => {
    res.redirect('home');
});

app.get('/home', (req, res) => {
    res.render('index', {user: req.session.user || null});
});

app.get('/calendars', (req, res) => {
    res.render('calendars', {user: req.session.user || null});
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
            res.send('An error occured, please check the server output');
        } else {
            res.redirect('/');
        }
    });
});

app.get('/calendars/add', (req, res) => {
    // TODO: Need to make it work with authentication
    res.render('add-calendars', {user: req.session.user || null});
});

app.post('/calendars/add', (req, res) => {
    // TODO: Need to make it work with authentication
    // TODO: Error handling
    const calendarObj = {
        calendarName: req.body.calendarName,
        days: req.body.days,
        videos: []
    }
    res.render('add-videos', calendarObj);
});

app.get('/calendars/add/video', (req, res) => {

});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {
    // make account + sign in
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
                const hashedPassword = hashPassword(req.body.password);
                // TODO: Fix password/promise thing
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
            }
        });
    }
});

async function hashPassword(password) {
    const hashedPassword = await new Promise((resolve, reject) => {
        bcrypt.hash(password, 10, function(err, hash) {
            if (err) {
                reject(err);
            } else {
                resolve(hash);
            }
        });
    });
    return hashedPassword;
}

app.listen(process.env.PORT || 3000);