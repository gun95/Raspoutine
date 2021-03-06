let request = require('request');


let url = process.env.url;

let postNbConnect = function (numberConnectUser) {

    let document = {
        json: {
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            nbConnected: numberConnectUser
        }
    };
    request.post(
        url + "nbconnect/_doc",
        document,
        function (error, response, body) {
                console.log("postNbConnect : ", body);
        }

    );
};

let postLastConnect = function (id, userName, channel, action) {

    let document = {
        json: {
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            id: id,
            userName: userName,
            channel: channel,
            action: action
        }
    };
    request.post(
        url + "user/_doc",
        document,
        function (error, response, body) {
            console.log("postLastConnect : ", body);

        }

    );
};

let nbconnect = {
    json:
        {
            "mappings": {
                "doc": {
                    "properties": {
                        "timestamp": {
                            "type": "date",
                            "format": "yyyy-MM-dd HH:mm:ss"
                        },
                        "nbConnected": {
                            "type": "long"
                        }
                    }
                }
            }
        }
};

let user = {
    json:
        {
            "mappings": {
                "doc": {
                    "properties": {
                        "timestamp": {
                            "type": "date",
                            "format": "yyyy-MM-dd HH:mm:ss"
                        },
                        "id": {
                            "type": "keyword"
                        },
                        "userName": {
                            "type": "keyword"
                        },
                        "channel": {
                            "type": "keyword"
                        },
                        "action": {
                            "type": "keyword"
                        }
                    }
                }
            }
        }
};

let putMapping = function () {
    request.put(
        url + "nbconnect",
        nbconnect,
        function (error, response, body) {
            console.log(body)
        }
    );
    request.put(
        url + "user",
        user,
        function (error, response, body) {
            console.log(body)
        }
    );
};


module.exports.postNbConnect = postNbConnect;
module.exports.putMapping = putMapping;
module.exports.postLastConnect = postLastConnect;