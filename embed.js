const Discord = require("discord.js");

let getEmbed = function (author) {

    let embed = new Discord.RichEmbed()

        .setColor([156, 36, 46])
        .setFooter("Raspoutine | © Developpé par Gun95", "https://cdn.discordapp.com/app-icons/439803463392690176/315e5090e64c36fab3727e7bcbd18a89.png")
        /*
         * Takes a Date object, defaults to current date.
         */
        .setTimestamp();
    return embed;
};
module.exports.getEmbed = getEmbed;
