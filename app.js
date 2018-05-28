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
        response = "NumberConnectUser set to "  + numberConnectUser;
        kibana.postNbConnect(numberConnectUser);
    }
    else if  (tmp[1] === "setmapping")
    {
        kibana.putMapping();
        response = "Mapping done";
    }else if (tmp[1] === "user")
        countUser();
    else
        response = message;
    return response;
}

client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel
    let oldUserChannel = oldMember.voiceChannel

    console.log("--------------------------------------");
   // console.log(client.channels.get("221345549578797057").members.get('178421128149073920').user.username);
    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        // User Joins a voice channel
        console.log(newMember.displayName  + " join " + newUserChannel.name);
        kibana.postLastConnect(newMember.displayName, newUserChannel.name, "join");
    } else if (newUserChannel === undefined) {
        // User leaves a voice channel
        console.log(oldMember.displayName + " leave " + oldUserChannel.name);
        kibana.postLastConnect(oldMember.nickname, oldUserChannel.name, "leave");
    }
});

let countUser = function () {
    numberConnectUser = 0;
    client.channels.forEach(function (value, key, map) {
        if (client.channels.get(key).type === "voice")
            numberConnectUser += client.channels.get(key).members.size
    });
    console.log('numberConnectUser = ' + numberConnectUser);
};

function intervalFunc() {
    countUser();
    kibana.postNbConnect(numberConnectUser);
}

setInterval(intervalFunc, 300 * 1000);
client.login(process.env.token);

module.exports = app;
