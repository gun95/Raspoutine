var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const Discord = require('discord.js');


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

let kibana = require("./kibana.js");
let bungie = require("./bungie.js");
let embed = require("./embed.js");

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

let role = ["LevN LVL 1", "LevN LVL 2", "LevN LVL 3",
    "LevP LVL 1", "LevP LVL 2", "LevP LVL 3",
    "ArgosN LVL 1", "ArgosN LVL 2", "ArgosN LVL 3",
    "ArgosP LVL 1", "ArgosP LVL 2", "ArgosP LVL 3",
    "FlecheN LVL 1", "FlecheN LVL 2", "FlecheN LVL 3",
    "FlecheP LVL 1", "FlecheP LVL 2", "FlecheP LVL 3",
];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setChannelLog();
    client.user.setPresence({game: {name: 'Send Warsat to Guardian '}, status: 'online'})
        .catch(console.error);
});

client.on('message', message => {

    if (message.content.startsWith(botPrefix)) {
        findCmd(message.content, message);
    }
});

function findCmd(content, message) {
    let tmp = content.split("$");
    tmp = tmp[1].split(" ");
    let response = "";
    if (tmp[0] === "setnb" && tmp.length === 2 && tmp[1] !== null) {
        numberConnectUser = parseInt(tmp[1]);
        response = "NumberConnectUser set to " + numberConnectUser;
        kibana.postNbConnect(numberConnectUser);
    } else if (tmp[0] === "createrole") {
        for (let i = 0; i < role.length; i++) {
            message.guild.createRole({
                name: role[i],
                color: [255, 255, 255],
                mentionable: true
            })
                .then(role => message.reply("Created new role with name " + role.name))
                .catch(console.error)
        }
    }
    else if (tmp[0] === "setmapping") {
        kibana.putMapping();
        response = "Mapping done";
    } else if (tmp[0] === "user") {
        countUser();
        response = numberConnectUser.toString();
    } else if (tmp[0] === "rank") {
        let userName;
        if (tmp.length === 2 && tmp[1] !== null)
            userName = tmp[1].splice(tmp[1].search('#') + 1, 0, "23");
        else
            userName = message.member.displayName.splice(message.member.displayName.search('#') + 1, 0, "23");

        userName = userName.replace("#", "%");
        console.log("result = " + userName);
        response = "Searching...";
        //search user by name
        bungie.getSearchAcount(userName, function (searchAcount) {
            if (searchAcount.Response.length !== 0) {
                //response = "Player found = " + searchAcount.Response[0].displayName;
                //get acount info
                bungie.getAcount(searchAcount.Response[0].membershipId, function (acount) {
                    //  console.log(acount.Response.profile.data.characterIds[0]);
                    //get charactere activity
                    bungie.getActivityByCharactere(acount.Response.profile.data.userInfo.membershipId, acount.Response.profile.data.characterIds, function (raid) {
                        setRole(message, raid, searchAcount.Response[0].displayName);
                    });
                });
            }
            else
                message.channel.send(embed.getEmbed().setDescription("No Player Found"))
                    .catch(console.error);
        });
    } else if (tmp[0] === "help") {
        let embedResponse = embed.getEmbed();
        if (tmp.length === 2 && tmp[1] === "fr") {
            embedResponse.setAuthor(message.member.displayName);
            embedResponse.setDescription("Ma surveillance s'étendra jusqu'aux limites de ce systeme et au-delà.Plus aucune menace ne pourra nous échapper\n" +
                "A partir de maintenant, je défendrai l'Humanité à ma façon.\n" +
                "JE SUIS RASPOUTINE,Gardien de tous ceux que j'observe. je suis sans égale.\n");
            embedResponse.addField("Mes Commandes :",
                "$rank : Défini vos rangs en fonction du nombre de raid que vous avez fini (nom afficher dans le discord en BatlleTag)\n" +
                "$rank <MonBatlleTag> : Défini vos rangs en fonction du nombre de raid que vous avez fini \n" +
                "$help : Pour voir ça\n");

            response = "";
            message.channel.send(embedResponse)
                .catch(console.error);
        }
        else {
            embedResponse.setAuthor(message.member.displayName);
            embedResponse.setDescription("My sight will stretch to the edge of this system and beyond. Never again will a threat go unsee.\n" +
                "From this day forward, i will defend Humanity on my onw terms.\n" +
                "I AM RASPUTIN, Guardian of all i survey. I have no equal\n");
            embedResponse.addField("My Command :",
                "$rank : set your raid rank depend on number of completion (Display Name in discord as BattleTag)\n" +
                "$rank <yourBattleTag> : set your raid rank depend on number of completion\n" +
                "$help : to see that\n");

            response = "";
            message.channel.send(embedResponse)
                .catch(console.error);
        }
    }
    else if (tmp[0] === "setlog") {
        console.log("log set in a channel #" + message.channel.name);
        channelIdForLog = message.channel.id;
        response = "log set in a channel #" + message.channel.name
    }
    else if (tmp[0] === "loup") {
        response = "";
        let embedResponse = embed.getEmbedRuleWorlf();
        //  console.log(embedResponse);
        message.channel.send(embedResponse)
            .catch(console.error);
    }
    else
        response = content;
    if (response !== null && response !== "" && response.length < 1024) {
        message.channel.send(embed.getEmbed().addField(message.member.displayName, response))
            .catch(console.error);
    }
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

client.on('messageDelete', message => {
    let tmp;
    let responseDelete = embed.getEmbed();
    responseDelete.setAuthor("Delete");
    responseDelete.addField("Author", message.member.displayName);
    responseDelete.addField("Channel", message.channel.name);
    if (message.content !== "")
        responseDelete.addField("Content", message.content);

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

    let tmp;
    let responseReactionAdd = embed.getEmbed();
    responseReactionAdd.setAuthor("Message Reaction Add");
    responseReactionAdd.addField("Author", messageReaction.message.author.username);
    responseReactionAdd.addField("Channel", messageReaction.message.channel.name);
    if (messageReaction.message.content !== "")
        responseReactionAdd.addField("Content", messageReaction.message.content);

    tmp = getAttachements(messageReaction.message);

    if (tmp !== "")
        responseReactionAdd.addField("Attachement", tmp);

    tmp = getReaction(messageReaction.message);
    if (tmp !== "")
        responseReactionAdd.addField("reaction", tmp);

    if (channelIdForLog !== null) {
        client.channels.get(channelIdForLog).send(responseReactionAdd)
            .catch(console.error);
    }
});

client.on('messageReactionRemove', messageReaction => {

    let tmp;
    let responseReactionRemove = embed.getEmbed();
    responseReactionRemove.setAuthor("Message Reaction Remove");
    responseReactionRemove.addField("Author", messageReaction.message.author.username);
    responseReactionRemove.addField("Channel", messageReaction.message.channel.name);
    if (messageReaction.message.content !== "")
        responseReactionRemove.addField("Content", messageReaction.message.content);

    tmp = getAttachements(messageReaction.message);
    if (tmp !== "")
        responseReactionRemove.addField("Attachement", tmp);

    tmp = getReaction(messageReaction.message);
    if (tmp !== "")
        responseReactionRemove.addField("reaction", tmp);

    if (channelIdForLog !== null) {
        client.channels.get(channelIdForLog).send(responseReactionRemove)
            .catch(console.error);
    }
});

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

//      set role
//      "LevN LVL 1",   0
//      "LevN LVL 2",   1
//      "LevN LVL 3",   2
//      "LevP LVL 1",   3
//      "LevP LVL 2",   4
//      "LevP LVL 3",   5
//      "ArgosN LVL 1", 6
//      "ArgosN LVL 2", 7
//      "ArgosN LVL 3", 8
//      "ArgosP LVL 1", 9
//      "ArgosP LVL 2", 10
//      "ArgosP LVL 3", 11
//      "FlecheN LVL 1",12
//      "FlecheN LVL 2",13
//      "FlecheN LVL 3",14
//      "FlecheP LVL 1",15
//      "FlecheP LVL 2",16
//      "FlecheP LVL 3",17

//       5 <= lvl 1 < 15
//       15 <= lvl 2 < 30
//       30 <= lvl 3

let responseRole = embed.getEmbed();

let removeRoleRaid =  function (message, ArrayListRole) {
    let roleToRemove = "";
    for (let i = 0; i < ArrayListRole.length; i++)
    {
        roleToRemove = message.member.guild.roles.find('name', ArrayListRole[i]);
        message.member.removeRole(roleToRemove)
            .catch(console.error);
    }
};

let addRoleRaid = function (message, numberRaid, title, key) {
     message.member.addRole(message.guild.roles.get(key).id)
        .catch(console.error);
    responseRole.addField(title + " : " + numberRaid, message.guild.roles.get(key).name);
};

let findRole = function (message, numberRaid, title, lvl1, lvl2, lvl3) {

    if (numberRaid >= 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === lvl3) {
                addRoleRaid(message, numberRaid, title, key);
                removeRoleRaid(message, [lvl1,lvl2])
            }
        });
    } else if (numberRaid >= 15 && numberRaid < 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === lvl2) {
                addRoleRaid(message, numberRaid, title, key);
                removeRoleRaid(message, [lvl1])
            }
        });
    }
    else if (numberRaid >= 5 && numberRaid < 15) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === lvl1) {
                addRoleRaid(message, numberRaid, title, key);
            }
        });
    } else
        responseRole.addField(title + " : " + numberRaid, "None");
};


let nameRaid = ["LEVIATHAN Normal",
    "LEVIATHAN Prestige",
    "EATER OF WORLDS Normal",
    "EATER OF WORLDS Prestige",
    "SPIRE OF STARS Normal",
    "SPIRE OF STARS Prestige"];

let setRole = function (message, raid, bungieName) {

    let y = 0;
    responseRole = embed.getEmbed();
    responseRole.addField("Player Found", bungieName);

    for (let i = 0; i < nameRaid.length; i++) {
         findRole(message, raid[i], nameRaid[i], role[y], role[y + 1], role[y + 2]);
        y += 3;
    }

    message.channel.send(responseRole);
};

function intervalFunc() {
    countUser();
    kibana.postNbConnect(numberConnectUser);
}

setInterval(intervalFunc, 300 * 1000);
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

client.on("error", (e) => console.error(e));
client.on("warn", (e) => console.warn(e));
//client.on("debug", (e) => console.info(e));

module.exports = app;