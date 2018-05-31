var request = require('request');
var rp = require('request-promise');

// raid report js file : js/constant/destiny.ts
const LEVIATHAN = {
    displayValue: 'Leviathan',
    versions: [{
        activityHashes: [417231112, 757116822, 1685065161, 2449714930, 3446541099, 3879860661],
        displayValue: 'Prestige',
    }, {
        activityHashes: [2693136600, 2693136601, 2693136602, 2693136603, 2693136604, 2693136605],
        displayValue: 'Normal',
    }, {
        activityHashes: [89727599, 287649202, 1699948563, 1875726950, 3916343513, 4039317196],
        displayValue: 'Guided Games',
    }],
};

const EATER_OF_WORLDS = {
    displayValue: 'Eater of Worlds',
    versions: [{
        activityHashes: [809170886],
        displayValue: 'Prestige',
    }, {
        activityHashes: [3089205900],
        displayValue: 'Normal',
    }, {
        activityHashes: [2164432138],
        displayValue: 'Guided Games',
    }],
};

const SPIRE_OF_STARS = {
    displayValue: 'Spire of Stars',
    versions: [{
        activityHashes: [3213556450],
        displayValue: 'Prestige',
    }, {
        activityHashes: [119944200],
        displayValue: 'Normal',
    }, {
        activityHashes: [3004605630],
        displayValue: 'Guided Games',
    }],
};

let levNormal = 0;
let levPrestige = 0;
let eatNormal = 0;
let eatPrestige = 0;
let spiNormal = 0;
let spiPrestige = 0;

const url = "https://www.bungie.net/Platform/Destiny2/";
let apiKey = process.env.bungie_key;

let getSearchAcount = function (userName,callback) {

    let options = {
        url: url + "SearchDestinyPlayer/-1/" + userName + "/",
        headers: {
            "X-API-Key": apiKey
        }
    };

    request(options, function (error, response, body) {
        console.log(body);
        let json = JSON.parse(body);
        callback(json);
    });
};


let getAcount = function (membershipId, callback) {

    let options = {
        url: url + "4/Profile/"+ membershipId +"/?components=100",
        headers: {
            "X-API-Key": apiKey
        }
    };
     levNormal = 0;
     levPrestige = 0;
     eatNormal = 0;
     eatPrestige = 0;
     spiNormal = 0;
     spiPrestige = 0;
    request(options, function (error, response, body) {
        console.log(body);
        let json = JSON.parse(body);
        callback(json);
    });
};


let getActivityByCharactere = function (membershipId, characterIds, callback) {

    for (let i = 0; i < characterIds.length; i++) {
        let options = {
            url: url + "4/Account/" + membershipId + "/Character/" + characterIds[i] + "/Stats/Activities/?page=0&mode=raid&count=250",
            headers: {
                "X-API-Key": apiKey
            }
        };

        rp(options)
            .then(function (body) {
                console.log(body);

                let json = JSON.parse(body);

                json.Response.activities.filter(function (item) {
                    //count for LEVIATHAN
                    for (let i = 0; i < LEVIATHAN.versions.length; i++) {
                        for (let y = 0; y < LEVIATHAN.versions[i].activityHashes.length; y++) {
                            if (item.activityDetails.referenceId === LEVIATHAN.versions[i].activityHashes[y] && item.values.completed.basic.value === 1) {
                                if (i === 0)
                                    levPrestige++;
                                else
                                    levNormal++;
                            }
                        }
                    }

                    //count for EATER_OF_WORLDS
                    for (let i = 0; i < EATER_OF_WORLDS.versions.length; i++) {
                        for (let y = 0; y < EATER_OF_WORLDS.versions[i].activityHashes.length; y++) {
                            if (item.activityDetails.referenceId === EATER_OF_WORLDS.versions[i].activityHashes[y] && item.values.completed.basic.value === 1) {
                                if (i === 0)
                                    eatPrestige++;
                                else
                                    eatNormal++;
                            }
                        }
                    }

                    //count for SPIRE_OF_STARS
                    for (let i = 0; i < SPIRE_OF_STARS.versions.length; i++) {
                        for (let y = 0; y < SPIRE_OF_STARS.versions[i].activityHashes.length; y++) {
                            if (item.activityDetails.referenceId === SPIRE_OF_STARS.versions[i].activityHashes[y] && item.values.completed.basic.value === 1) {
                                if (i === 0)
                                    spiPrestige++;
                                else
                                    spiNormal++;
                            }
                        }
                    }
                });
                //console.log("lev prestige = " + levPrestige + " lev normal " + levNormal);
                //console.log("eat prestige = " + eatPrestige + " eat normal " + eatNormal);
                //console.log("spi prestige = " + spiPrestige + " spi normal " + spiNormal);

            }).then(function () {
                if (i === 0)
                callback(getRaid());

        })
            .catch(function (err) {
                // API call failed...
            });
    }

};



let getRaid = function (){
    let raid = {
        levPrestige : levPrestige,
        levNormal : levNormal,
        eatPrestige : eatPrestige,
        eatNormal : eatNormal,
        spiPrestige : spiPrestige,
        spiNormal : spiNormal,
    };
    return raid;
};

module.exports.getActivityByCharactere = getActivityByCharactere;
module.exports.getSearchAcount = getSearchAcount;
module.exports.getAcount = getAcount;
module.exports.getRaid = getRaid;
