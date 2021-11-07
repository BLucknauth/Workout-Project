require('./db');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const Handlebars = require('hbs');
const bcrypt = require('bcryptjs');

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

app.get('/', (req, res) => {
    res.redirect('home');
});

app.get('/home', (req, res) => {
    res.render('index', {});
});

app.get('/calendars', (req, res) => {
    res.render('calendars');
});

app.get('/calendars/add', (req, res) => {
    // TODO: Need to make it work with authentication
    res.render('add-calendars');
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

app.listen(process.env.PORT);