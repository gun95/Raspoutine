var request = require('request');


let url = "http://localhost:9200/";

let postDocument = function (numberConnectUser) {

    let document = {
        json: {
            timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            nbConnected: numberConnectUser
        }
    };
    request.post(
        url + "nbconnect/doc",
        document,
        function (error, response, body) {
                console.log(body)
            console.log(document)

        }

    );
};

let mapping = {
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

let putMapping = function () {
    request.put(
        url + "nbconnect",
        mapping,
        function (error, response, body) {
            console.log(body)
        }
    );
};


module.exports.postDocument = postDocument;
module.exports.putMapping = putMapping;
