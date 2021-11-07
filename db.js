const mongoose = require('mongoose');


// after searching around -- most likely using Bcrypt for hashing pw + passport for authentication
const User = new mongoose.Schema({
    user: {type: String, unique: true}, //TODO: do type checking on input as well, shouldn't be case sensitive 
    hash: String,
    calendar: Array //array of calendars the user is currently using
});

const Calendar = new mongoose.Schema({ 
    name: String, // name of calendar
    creator: String, // creator of this calendar 
    users: Array, // users the creator has chosen to share calendar with 
    days: Number, // number of days in calendar
    videos: Array //an array of an array of video objects, each subarray represents a day
});