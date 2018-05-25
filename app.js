var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

var kibana = require("./kibana.js");

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

const Discord = require('discord.js');
const client = new Discord.Client();
const botPrefix = '!r';
let numberConnectUser = 0;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});


client.on('message', message => {

    if (message.content.startsWith(botPrefix)) {
        message.reply(findCmd(message.content));
    }
});

function findCmd(message) {
    let tmp = message.split(" ")
    let response;
    if (tmp[1] === "setnb")
    {
        numberConnectUser = parseInt(tmp[2]);
        response = "numberConnectUser set to "  + numberConnectUser;
        kibana.postNbConnect(numberConnectUser);
    }
    else
        response = message;
    return response;
}



client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel
    let oldUserChannel = oldMember.voiceChannel

    console.log("--------------------------------------");

    if (oldUserChannel === undefined && newUserChannel !== undefined) {

        // User Joins a voice channel
        console.log(newMember.nickname + " join " + newUserChannel.name);
        numberConnectUser++;
        kibana.postLastConnect(newMember.nickname, newUserChannel.name, "join");
    } else if (newUserChannel === undefined) {
        // User leaves a voice channel

        console.log(oldMember.nickname + " leave " + oldUserChannel.name);
        numberConnectUser--;
        kibana.postLastConnect(oldMember.nickname, oldUserChannel.name, "leave");
    }

})

console.log();


function intervalFunc() {
    console.log('numberConnectUser = ' + numberConnectUser);
    kibana.postNbConnect(numberConnectUser);
}

kibana.putMapping();
setInterval(intervalFunc, 300 * 1000);


client.login(process.env.token);
module.exports = app;
