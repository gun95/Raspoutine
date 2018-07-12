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

let getEmbedRuleWorlf = function () {

    let embed = new Discord.RichEmbed()
        .setColor([156, 36, 46])
        .setFooter("Raspoutine | © Developpé par Gun95", "https://cdn.discordapp.com/app-icons/439803463392690176/315e5090e64c36fab3727e7bcbd18a89.png")
        /*
         * Takes a Date object, defaults to current date.
         */
        .setTimestamp()
        .setTitle("Règle 🐺appel-des-loups🐺")
        .setDescription("Bienvenue sur l'appel des loups, l'unique canal pour organiser la vie du clan via les activités en jeu, pour ce faire vous pouvez utilisez deux méthodes, voici leurs mode d'emploi :")
        .addField("__***Méthode 1 :***__","https://docs.google.com/document/d/1jGPjFCmaD7PaFeY0JNfZoiXg1yqUJ7GPQxC_jfo6KUQ/edit")
        .addField("__***Méthode 2 :***__","https://docs.google.com/document/d/1AC-Rh78-jvvwTpuPkyXDXBXCOvAZtpt20kQFvziKdq8/edit")
        .addField("• Pour que tout reste lisible et clair dans ce canal, ne vous remercierons par avance de ne pas floodé et de supprimez vos messages après coup si jamais une conversation s'engage malgré tout.","_ _")
        .addField("• Voici la classification pour l'expérience des membres du clan en raid :","Découverte -> N'as jamais fait le raid\nDébutant     -> Déjà fait, mais ne maitrise pas tout\nConfirmé     -> Déjà fait de nombreuse fois et maitrise la plupart des mécaniques\nExpert           -> GOD MOD ACTIVATED (Tout est maitrisé)\n\n")
        .addField("• Pour toute demande de découverte de raid, pour les nouveaux entre-autres, merci de laisser une réaction correspondant au raid demandé :",":thumbsup: **Calus Normal**  / :yum: **Calus Prestige**\n:smiley: **Argos**  / :wolf:  **Argos Prestige**\n:poop:  **Flèche**  / :cry:   **Flèche Prestige**");

    return embed;
};

module.exports.getEmbedRuleWorlf = getEmbedRuleWorlf;


/*

https://leovoel.github.io/embed-visualizer/

{
    "embed": {
    "title": "Règle 🐺appel-des-loups🐺",
    "description" : "Bienvenue sur l'appel des loups , l'unique canal pour organiser la vie du clan via les activités en jeu, pour ce faire vous pouvez utilisez deux méthodes, voici leurs mode d'emploi :",
    "color": 13210230,
    "timestamp": "2018-07-12T11:39:54.910Z",
    "footer": {
      "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
      "text": "footer text"
    },
    "fields": [
      {
        "name": "__***Méthode 1 :***__",
        "value": "https://docs.google.com/document/d/1jGPjFCmaD7PaFeY0JNfZoiXg1yqUJ7GPQxC_jfo6KUQ/edi"
      },
      {
        "name": "__***Méthode 2 :***__",
        "value": "https://docs.google.com/document/d/1AC-Rh78-jvvwTpuPkyXDXBXCOvAZtpt20kQFvziKdq8/edit\n\n"
      },
      {
        "name": "• Pour que tout reste lisible et clair dans ce canal, ne vous remercierons par avance de ne pas floodé et de supprimez vos messages après coup si jamais une conversation s'engage malgré tout.",
        "value": "_ _"
      },
      {
        "name": "• Voici la classification pour l'expérience des membres du clan en raid :",
        "value": "Découverte -> N'as jamais fait le raid\nDébutant     -> Déjà fait, mais ne maitrise pas tout\nConfirmé     -> Déjà fait de nombreuse fois et maitrise la plupart des mécaniques\nExpert           -> GOD MOD ACTIVATED (Tout est maitrisé)\n\n"
      },
      {
        "name": "• Pour toute demande de découverte de raid, pour les nouveaux entre-autres, merci de laisser une réaction correspondant au raid demandé :",
        "value": ":thumbsup: **Calus Normal**  / :yum: **Calus Prestige**\n:smiley: **Argos**  / :wolf:  **Argos Prestige**\n:poop:  **Flèche**  / :cry:   **Flèche Prestige**"
      }
    ]
  }
}
 */