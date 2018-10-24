'use strict';
const kibana = require("./kibana.js");
const bungie = require("./bungie.js");
const embed = require("./embed.js");
const myTime = require("./myTime.js");
const app = require("./app.js");

let role = ["LevN LVL 1", "LevN LVL 2", "LevN LVL 3",
    "LevP LVL 1", "LevP LVL 2", "LevP LVL 3",
    "ArgosN LVL 1", "ArgosN LVL 2", "ArgosN LVL 3",
    "ArgosP LVL 1", "ArgosP LVL 2", "ArgosP LVL 3",
    "FlecheN LVL 1", "FlecheN LVL 2", "FlecheN LVL 3",
    "FlecheP LVL 1", "FlecheP LVL 2", "FlecheP LVL 3",
];
let roleClass = ["Chasseur", "Arcaniste", "Titan"];

let channelIdForLog = null;


module.exports = {
    'test': test,
    'createRole' : createRole,
    'setMapping' : setMapping,
    'rank' : rank,
    'help': help,
    'loup' : loup,
    'setLog' : setLog,
    'team' : team,
    'time' : time,
    'setPresence' : setPresence
};

function test(message) {
    console.log(message);
    message.channel.send(message.content);
}

let response = "";
function createRole(message) {
    createRoleOnServer(message, roleClass, 233, 30, 99);
    createRoleOnServer(message, role, 255, 255, 255);

}

let createRoleOnServer = function (message, role, r, g, b) {
    for (let i = 0; i < role.length; i++) {
        message.guild.createRole({
            name: role[i],
            color: [r, g, b],
            mentionable: true
        })
            .then(role => message.reply("Created new role with name " + role.name))
            .catch(console.error)
    }
};

function setMapping(message) {
    kibana.putMapping();
    response = "Mapping done";
    sendMsg(message);
}

function rank(message) {
    let tmp = message.content.split("$");
    tmp = tmp[1].split(" ");
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
    sendMsg(message);
}

let myAddField = function (embed, title, response) {
    if (response.length < 1024) {
        embed.addField(title, response);
        return embed;
    }
    else {
        let array = response.match(/[\s\S]{1,1023}/g) || [];
        embed.addField(title, array[0]);
        for (let i = 1; i < array.length; i++) {
            embed.addField("_ _", array[i]);
        }
        return embed;
    }
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

let removeRoleRaid = function (message, ArrayListRole) {
    let roleToRemove = "";
    for (let i = 0; i < ArrayListRole.length; i++) {
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
                removeRoleRaid(message, [lvl1, lvl2])
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
    message.channel.send(responseRole)
        .catch(console.error);
};


function help(message){
    let tmp = message.content.split("$");
    tmp = tmp[1].split(" ");
    let embedResponse = embed.getEmbed();
    if (tmp.length === 2 && tmp[1] === "fr") {
        if (message.member.displayName != null)
        embedResponse.setAuthor(message.member.displayName);
        embedResponse.setDescription("Ma surveillance s'étendra jusqu'aux limites de ce systeme et au-delà.Plus aucune menace ne pourra nous échapper\n" +
            "A partir de maintenant, je défendrai l'Humanité à ma façon.\n" +
            "JE SUIS RASPOUTINE,Gardien de tous ceux que j'observe. je suis sans égale.\n");
        embedResponse.addField("Mes Commandes :",
            "$rank : Défini vos rangs en fonction du nombre de raid que vous avez fini (nom afficher dans le discord en BatlleTag)\n" +
            "$rank <MonBatlleTag> : Défini vos rangs en fonction du nombre de raid que vous avez fini \n" +
            "$help : Pour voir ça\n" +
            "$team <titan,warlork,hunter> : choisie ta classe préféré et montre le aux autres\n" +
            "$time : Donne le temps present sur le discord en vocal");


        message.channel.send(embedResponse)
            .catch(console.error);
    }
    else {
        if (message.member.displayName != null)
        embedResponse.setAuthor(message.member.displayName);
        embedResponse.setDescription("My sight will stretch to the edge of this system and beyond. Never again will a threat go unsee.\n" +
            "From this day forward, i will defend Humanity on my onw terms.\n" +
            "I AM RASPUTIN, Guardian of all i survey. I have no equal\n");
        embedResponse.addField("My Command :",
            "$rank : set your raid rank depend on number of completion (Display Name in discord as BattleTag)\n" +
            "$rank <yourBattleTag> : set your raid rank depend on number of completion\n" +
            "$help : to see that\n");
        message.channel.send(embedResponse)
            .catch(console.error);
    }
}
 function setLog(message) {
     console.log("log set in a channel #" + message.channel.name);
     channelIdForLog = message.channel.id;
     response = "log set in a channel #" + message.channel.name
    sendMsg(message);
 }

function loup(message) {
    let embedResponse = embed.getEmbedRuleWorlf();
    //  console.log(embedResponse);
    message.channel.send(embedResponse)
        .catch(console.error);
}

function team(message){
    let tmp = message.content.split("$");
    tmp = tmp[1].split(" ");
    let roleName = "";
    let titre = "";
    if (tmp.length === 2) {
        switch (tmp[1]) {
            case "chasseur":
                roleName = roleClass[0];
                titre = "Cayde-6 serais fière de toi !" ;
                break;
            case "arcaniste" :
                roleName = roleClass[1];
                titre = "Gardien ! Ça fait plaisir de vous voir !";
                break;
            case "titan" :
                roleName = roleClass[2];
                titre = "On a besoin que vous agissiez Gardien.";
                break
        }

        let roleToRemove = "";
        for (let i = 0; i < roleClass.length; i++) {
            roleToRemove = message.member.guild.roles.find('name', roleClass[i]);
            message.member.removeRole(roleToRemove)
                .catch(console.error);
        }
        message.member.addRole(message.member.guild.roles.find('name', roleName))
            .catch(console.error);
        message.reply(titre).catch(console.error);
    }
}


function time(message){

    console.log("time : " + message.member.displayName);
    let embedResponse = embed.getEmbed();
    embedResponse.setAuthor(message.member.displayName);

    myTime.postGetTimeSevenDay(message.member.displayName, function (totalTime) {

        embedResponse.addField("Présence sur le discord c'est 7 derniers jours :", convertMinsToHrsMins(totalTime) + " heures");
    });

    myTime.postGetAllTime(message.member.displayName, function (totalTime) {

        embedResponse.addField("Présence sur le discord au Total :", convertMinsToHrsMins(totalTime) + " heures");
        message.channel.send(embedResponse)
            .catch(console.error);
    });

}

function convertMinsToHrsMins(mins) {
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    return `${h}:${m}`;
}

function setPresence(message)
{
    let tmp = message.content.split("$");
    tmp = tmp[1].split("presence");
    if (tmp.length === 2) {
        app.setPresence(tmp[1]);
        response = "Presence set to : " + tmp[1];
        sendMsg(message);
    }
}

let sendMsg = function(message){
    if (response !== null && response !== "") {
        message.channel.send(myAddField(embed.getEmbed(), message.member.displayName, response)).catch(console.error);
    }
    response = "";
};