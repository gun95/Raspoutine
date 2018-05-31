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

let kibana = require("./kibana.js");
let bungie = require("./bungie.js");

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
const botPrefix = '$';
let numberConnectUser = 0;

let role = ["LevN LVL 1", "LevN LVL 2", "LevN LVL 3",
    "LevP LVL 1", "LevP LVL 2", "LevP LVL 3",
    "ArgosN LVL 1", "ArgosN LVL 2", "ArgosN LVL 3",
    "ArgosP LVL 1", "ArgosP LVL 2", "ArgosP LVL 3",
    "FlecheN LVL 1", "FlecheN LVL 2", "FlecheN LVL 3",
    "FlecheP LVL 1", "FlecheP LVL 2", "FlecheP LVL 3",
];

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {

    if (message.content.startsWith(botPrefix)) {
        findCmd(message.content, message);
    }
});

function findCmd(content, message) {
    let tmp = content.split("$");
    tmp = tmp[1].split(" ");
    let response;
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
    } else if (tmp[0] === "rank" && tmp.length === 2 && tmp[1] !== null) {
        let userName = tmp[1].splice(tmp[1].search('#') + 1, 0, "23");
        userName = userName.replace("#", "%");
        console.log("result = " + userName);
        response = "Searching";
        //search user by name
        bungie.getSearchAcount(userName, function (searchAcount) {
            if (searchAcount.Response.length !== 0) {
                response = "Player found = " + searchAcount.Response[0].displayName;
                //get acount info
                bungie.getAcount(searchAcount.Response[0].membershipId, function (acount) {
                    console.log(acount.Response.profile.data.characterIds[0]);
                    //get charactere activity
                    bungie.getActivityByCharactere(acount.Response.profile.data.userInfo.membershipId, acount.Response.profile.data.characterIds, function (raid) {
                        message.reply(response + "\nLev Prestige : " + raid.levPrestige + "\nLev normal : " + raid.levNormal + "\nArgos : " + raid.eatNormal + "\nFleche : " + raid.spiNormal);
                        setRole(message, raid);
                    });
                });
            }
            else
                message.reply("Sorry no player found");
        });
    } else if (tmp[0] === "help") {
        if (tmp.length === 2 && tmp[1] === "fr")
            response = "\n" +
                "Ma surveillance s'étendra jusqu'aux limites de ce systeme et au-delà.Plus aucune menace ne pourra nous échapper\n" +
                "A partir de maintenant, je défendrai l'Humanité à ma façon. JE SUIS RASPOUTINE,Gardien de tous ceux que j'observe. je suis sans égale.\n" +
                "Mes Commandes : \n" +
                "\trank MonBatlleTag: Défini vos rangs en fonction du nombre de raid que vous avez fini \n" +
                "\thelp : Pour voir ça\n"
        else
            response = "\n" +
                "My sight will stretch to the edge of this system and beyond. Never again will a threat go unsee.\n" +
                "From this day forward, i will defend Humanity on my onw terms.\n" +
                "I AM RASPUTIN, Guardian of all i survey. I have no equal\n" +
                "My Command : \n" +
                "\trank yourBattleTag: set your raid rank depend on number of completion\n" +
                "\thelp : to see that\n"

    }
    else
        response = content;
    message.reply(response);
}


client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;

    console.log("--------------------------------------");
    if (oldUserChannel === undefined && newUserChannel !== undefined) {
        // User Joins a voice channel
        console.log(newMember.displayName + " join " + newUserChannel.name);
        kibana.postLastConnect(newMember.displayName, newUserChannel.name, "join");
    } else if (newUserChannel === undefined) {
        // User leaves a voice channel
        console.log(oldMember.displayName + " leave " + oldUserChannel.name);
        kibana.postLastConnect(oldMember.displayName, oldUserChannel.name, "leave");
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

let setRole = function (message, raid) {

    if (raid.spiPrestige >= 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[17]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    } else if (raid.spiPrestige >= 15 && raid.spiPrestige < 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[16]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }
    else if (raid.spiPrestige >= 5 && raid.spiPrestige < 15) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[15]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }
    if (raid.spiNormal >= 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[14]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    } else if (raid.spiNormal >= 15 && raid.spiNormal < 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[13]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }
    else if (raid.spiNormal >= 5 && raid.spiNormal < 15) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[12]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }

    if (raid.eatPrestige >= 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[11]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    } else if (raid.eatPrestige >= 15 && raid.eatPrestige < 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[10]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }
    else if (raid.eatPrestige >= 5 && raid.eatPrestige < 15) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[9]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }

    if (raid.eatNormal >= 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[8]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    } else if (raid.eatNormal >= 15 && raid.eatNormal < 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[7]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }
    else if (raid.eatNormal >= 5 && raid.eatNormal < 15) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[6]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }
    if (raid.levPrestige >= 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[5]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    } else if (raid.levPrestige >= 15 && raid.levPrestige < 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[4]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }
    else if (raid.levPrestige >= 5 && raid.levPrestige < 15) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[3]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }
    if (raid.levNormal >= 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[2]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    } else if (raid.levNormal >= 15 && raid.levNormal < 30) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[1]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }
    else if (raid.levNormal >= 5 && raid.levNormal < 15) {
        message.guild.roles.forEach(function (value, key, map) {
            if (message.guild.roles.get(key).name === role[0]) {
                console.log(message.guild.roles.get(key).id);
                message.member.addRole(message.guild.roles.get(key).id);
                message.reply("New rank add : " + message.guild.roles.get(key).name);
            }
        });
    }
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


module.exports = app;