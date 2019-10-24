let request = require('request');
var moment = require('moment');


let url = process.env.url + "/user/_doc/_search";

let postGetTimeDays = function (userName, days, callback) {

    let document = {
        json: {
            "from": 0,
            "size": 10000,
            "query": {
                "bool": {
                    "must": [
                        {
                            "query_string": {
                                "default_field": "userName",
                                "query": userName
                            }
                        },
                        {
                            "range": {
                                "timestamp": {
                                    "gte": "now-" + days + "d/d",
                                    "lt": "now/d"
                                }
                            }
                        }
                    ]
                }
            },
            "sort": [
                {"timestamp": {"order": "desc"}}
            ]
        }
    };
    request.post(
        url,
        document,
        function (error, response, body) {
            if (userName !== "*")
                callback(getTimeFromRequest(body.hits.hits));
            else
                callback(getTimeFromRequestAllDiscord(body.hits.hits));
        }
    );
};

let postGetAllTime = function (userName, callback) {
    let document = {
        json: {
            "from": 0,
            "size": 10000,
            "query": {
                "bool": {
                    "must": [
                        {
                            "query_string": {
                                "default_field": "userName",
                                "query": userName
                            }
                        }
                    ]
                }
            },
            "sort": [
                {"timestamp": {"order": "desc"}}
            ]
        }
    };
    request.post(
        url,
        document,
        function (error, response, body) {
            callback(getTimeFromRequest(body.hits.hits));
        }
    );
};


let getTimeFromRequest = function (json) {
    let totalTime = 0;
    for (let i = 0; i < json.length; i = i + 2) {
        //skip if people are actually on the server
        if (i + 1 < json.length && i === 0 && json[i]._source.action === "join")
            i++;
        if (i + 1 < json.length && json[i]._source.action === "leave" && json[i + 1]._source.action === "join") {
            //console.log("i = ",i , " : " , json[i]._source.action + " channel = " + json[i]._source.channel);
            //console.log("i + 1 = ", json[i + 1]._source.action + " channel = " + json[i + 1]._source.channel);

            let date1 = moment(json[i]._source.timestamp)
            let date2 = moment(json[i + 1]._source.timestamp)
            var duration = moment.duration(date1.diff(date2));
            var min = duration.asMinutes();
            totalTime += Math.round(min)
            //console.log(date1)
            //console.log(date2)
            //console.log(Math.round(min))
        }
    }
    return convertMinsToHrsMins(totalTime);
};


let getTimeFromRequestAllDiscord = function (json) {

    let find = 0;
    let tab = {};

    for (let i = 0; i < json.length; i++) {
        for (let y = 0; y < Object.keys(tab).length; y++) {
            if (Object.keys(tab)[y] === json[i]._source.userName)
                find = 1
        }
        if (find === 0)
            tab[json[i]._source.userName] = [];
        else
            find = 0;

        tab[json[i]._source.userName].push(json[i]);
    }

    //console.log(JSON.stringify(tab));
    let finalTab = [];
    for (let key in tab) {
        let value = tab[key];
        finalTab.push(key + ";" + getTimeFromRequest(value));
    }

    return finalTab.sort();

};

function convertMinsToHrsMins(mins) {
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    h = h < 10 ? '0' + h : h;
    m = m < 10 ? '0' + m : m;
    return `${h}:${m}`;
}

module.exports.postGetTimeDays = postGetTimeDays;
module.exports.postGetAllTime = postGetAllTime;

module.exports.getTimeFromRequest = getTimeFromRequest;
module.exports.getTimeFromRequestAllDiscord = getTimeFromRequestAllDiscord;