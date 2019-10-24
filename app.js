let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let indexRouter = require('./routes/index');
let usersRouter = require('./routes/users');


let app = express();

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

const Discord = require('discord.js');
const kibana = require("./kibana.js");
const embed = require("./embed.js");
const cmds = require('./commands.js');


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

const client = new Discord.Client();
const botPrefix = '$';
let numberConnectUser = 0;
let channelIdForLog = null;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    console.log("token : ", process.env.token)
    console.log("url : ", process.env.url)

    setChannelLog();
    client.user.setPresence({game: {name: 'Torturer DrL4CO'}, status: 'online'})
        .catch(console.error);
});

client.on('message', message => {

    if (message.content.startsWith(botPrefix)) {
        //findCmd(message.content, message);
        let cmd = message.content.split(/\s+/)[0].slice(botPrefix.length).toLowerCase();
        getCmdFunction(cmd)(message);

    } else if (message.author.id === "296023718839451649" &&
        (message.content.includes("has joined  LFG Post") ||
            message.content.includes("has left  LFG Post") ||
            message.content.includes("changed to an alternate for  LFG Post") ||
            message.content.includes("is an alternate for  LFG Post")
        ))
        logCharlemagneMsgCreate(message);

});

function getCmdFunction(cmd) {
    const COMMANDS = {
        'test': cmds.test,
        'createrole': cmds.createRole,
        'setmapping': cmds.setMapping,
        'rank': cmds.rank,
        'help': cmds.help,
        'loup': cmds.loup,
        'setlog': cmds.setLog,
        'team': cmds.team,
        'time': cmds.time,
        'presence': cmds.setPresence,
        'alltime': cmds.allTime
    };
    return COMMANDS[cmd] ? COMMANDS[cmd] : () => {
    };
}

let getAttachements = function (msg) {
    let attachement = "";
    msg.attachments.forEach(function (value, key, map) {
        attachement += value.url + "\n";
    });

    return attachement;
};

let getReaction = function (msg) {
    let reaction = "";
    msg.reactions.forEach(function (value, key, map) {
        let tmpEmot = key;
        msg.reactions.get(key).users.forEach(function (value, key, map) {
            reaction += tmpEmot + " by " + value.username + "\n";
        });
    });
    return reaction;
};

client.on('messageDelete', async (message) => {
    let user = "";
    let tmp;
    let responseDelete = embed.getEmbed();
    const audit = await message.guild.fetchAuditLogs({type: 'MESSAGE_DELETE'}).then(audit => audit.entries.first())

    responseDelete.setAuthor("Message Delete");

    if (audit.extra.channel.id === message.channel.id
        && (audit.target.id === message.author.id)
        && (audit.createdTimestamp > (Date.now() - 5000))
        && (audit.extra.count >= 1)) {
        console.log("executor");
        user = message.guild.members.find('id', audit.executor.id).displayName
        responseDelete.addField("Executor", user)
    }

    responseDelete.addField("   Author", message.member.displayName);
    responseDelete.addField("Channel", message.channel.name);

    if (message.content !== "") {
        //responseDelete.addField("Content", message.content);
        responseDelete = myAddField(responseDelete, "Content", message.content);
    }
    tmp = getAttachements(message);

    if (tmp !== "")
        responseDelete.addField("Attachement", tmp);

    tmp = getReaction(message);
    if (tmp !== "")
        responseDelete.addField("reaction", tmp);

    if (channelIdForLog !== null) {
        client.channels.get(channelIdForLog).send(responseDelete)
            .catch(console.error);
    }

});

client.on('messageReactionAdd', messageReaction => {

    if (messageReaction.message.author.id !== "296023718839451649") {
        messageReactionLog("Add", messageReaction);
    }
});

client.on('messageReactionRemove', messageReaction => {

    messageReactionLog("Remove", messageReaction);
});

let messageReactionLog = function (type, messageReaction) {
    let tmp;
    let responseReaction = embed.getEmbed();
    responseReaction.setAuthor("Message Reaction " + type);
    responseReaction.addField("Author", messageReaction.message.author.username);
    responseReaction.addField("Channel", messageReaction.message.channel.name);
    if (messageReaction.message.content !== "")
    //responseReaction.addField("Content", messageReaction.message.content);
        responseReaction = myAddField(responseReaction, "Content", messageReaction.message.content);
    tmp = getAttachements(messageReaction.message);
    if (tmp !== "")
        responseReaction.addField("Attachement", tmp);

    tmp = getReaction(messageReaction.message);
    if (tmp !== "")
        responseReaction.addField("reaction", tmp);

    if (channelIdForLog !== null) {
        client.channels.get(channelIdForLog).send(responseReaction)
            .catch(console.error);
    }
};


let logCharlemagneMsgCreate = function (message) {

    let tmp;
    let responseMessageAdd = embed.getEmbed();
    responseMessageAdd.setAuthor("Message Reaction Remove");
    responseMessageAdd.addField("Author", message.author.username);
    responseMessageAdd.addField("Channel", message.channel.name);

    if (message.content !== "")
    //responseReactionRemove.addField("Content", messageReaction.message.content);
        responseMessageAdd = myAddField(responseMessageAdd, "Content", message.content);
    tmp = getAttachements(message);
    if (tmp !== "")
        responseMessageAdd.addField("Attachement", tmp);

    tmp = getReaction(message);
    if (tmp !== "")
        responseMessageAdd.addField("reaction", tmp);

    if (channelIdForLog !== null) {
        client.channels.get(channelIdForLog).send(responseMessageAdd)
            .catch(console.error);
    }
};

client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;

    console.log("--------------------------------------");
    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        // User Joins a voice channel
        console.log(newMember.displayName + " join " + newUserChannel.name);
        kibana.postLastConnect(newMember.id, newMember.displayName, newUserChannel.name, "join");
    } else if (newUserChannel === undefined) {
        // User leaves a voice channel
        console.log(oldMember.displayName + " leave " + oldUserChannel.name);
        kibana.postLastConnect(oldMember.id, oldMember.displayName, oldUserChannel.name, "leave");
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

setInterval(intervalFunc, 600 * 1000);
client.login(process.env.token);


if (!String.prototype.splice) {
    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function (start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
};


let setChannelLog = function () {
    client.user.client.channels.forEach(function (value, key, map) {
        if (client.channels.get(key).name === "log") {
            channelIdForLog = key;
            console.log("log channel id ", key);
            if (channelIdForLog !== null) {
                let response = embed.getEmbed();
                response.addField("Raspoutine", "log set in a channel here");
                client.channels.get(channelIdForLog).send(response)
                    .catch(console.error);
            }
        }
    });
};

let setPresence = function (title) {
    client.user.setPresence({game: {name: title}, status: 'online'})
        .catch(console.error);
};


let myAddField = function (embed, title, response) {
    if (response.length < 1024) {
        embed.addField(title, response);
        return embed;
    } else {
        let array = response.match(/[\s\S]{1,1023}/g) || [];
        embed.addField(title, array[0]);
        for (let i = 1; i < array.length; i++) {
            embed.addField("_ _", array[i]);
        }
        return embed;
    }
};

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));

//const myTime = require("./myTime.js");
//var json =




//console.log("time = ", myTime.getTimeFromRequest(json));
//console.log("time all : ", myTime.getTimeFromRequestAllDiscord(json));

module.exports.setPresence = setPresence;
module.exports = app;
