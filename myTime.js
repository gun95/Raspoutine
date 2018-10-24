let request = require('request');

let url = "https://search-raspoutine-j3jyfnal43scwwjwo7y6p2cohi.eu-west-3.es.amazonaws.com/user/doc/_search";

let postGetTimeSevenDay = function (userName, callback) {

    let document = {
        json: {
            "from": 0,
            "size": 2000,
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
                                    "gte": "now-7d/d",
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
            callback(getTimeFromRequest(body.hits.hits));
        }
    );
};

let postGetAllTime = function (userName, callback) {
    let document = {
        json: {
            "from": 0,
            "size": 5000,
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
    let msMinute = 60 * 1000;
    let msDay = 60 * 60 * 24 * 1000;
    let totalTime = 0;
    for (let i = 0; i < json.length; i = i + 2) {
        if (i + 1 < json.length && i === 0 && json[i]._source.action === "join" )
            i++;
        if (i + 1 < json.length && json[i]._source.action === "leave" && json[i + 1]._source.action === "join" ) {
            //console.log("i = " + json[i]._source.action + " channel = " + json[i]._source.channel);
            //console.log("i + 1 = ", json[i + 1]._source.action + " channel = " + json[i + 1]._source.channel);

            let date1 = new Date(json[i]._source.timestamp);
            let date2 = new Date(json[i + 1]._source.timestamp);
            totalTime += Math.floor(((date1 - date2) % msDay) / msMinute);
        }
    }
        return totalTime;
};



module.exports.postGetTimeSevenDay = postGetTimeSevenDay;
module.exports.postGetAllTime = postGetAllTime;
