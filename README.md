# Raspoutine

------
Raspoutine is a disord bot, his primary role is oversight.

## Config

------
You need discord api key\
You can set up in your env under "token"\
If you want change look at L.367 in app.js


You need a elasticsearch and kibana for collect data and make dashbord\
You can set up in you env under "url"\
If you want change look at L.4 in kibana.js

You need bungie api key \
You can set up in yout env under "bungie_key"\
If you want change look at L.55 in bungie.js


## Set up

------

```javascript
npm install
npm start
```

Add Raspoutine to you discord server 

If you use kibana do this
(in any channel where Raspoutine can read/write)
$setmapping
This create mapping in elasticsearch 

If you want use $rank do this
$createrole 
This create some role in discord server

You can have log of your discord server if you create a text channel named "log" ($setLog disable)

## Command list

------

All command start with '$'\
You can change it at L.49 in app.js

* createrole
    * Create a list of role
* help
    * Display help command
* rank <yourb.net>
    * Assigns you roles according to number of raid
* rank
    * Assigns you roles according to number of raid (take discord display name)
 * setlog
    * Do this in the channel where you want see log
* setmapping
    * Create mapping for elasticsearch
* user
    * Display the number of player connect
    
## Backup

------
```javascript
npm install -g elasticdump

elasticdump --input=http://127.0.0.1:9200/user --output=https://XXXXXXXXXXXXXXXXXXX.amazonaws.com/user --type=mapping
elasticdump --limit=10000 --input=http://127.0.0.1:9200/user --output=https://XXXXXXXXXXXXXXXXXXX.amazonaws.com/user --type=data

elasticdump --input=http://127.0.0.1:9200/nbconnect --output=https://XXXXXXXXXXXXXXXXXXX.amazonaws.com/nbconnect --type=mapping
elasticdump --limit=10000 --input=http://127.0.0.1:9200/nbconnect --output=https://XXXXXXXXXXXXXXXXXXX.amazonaws.com/nbconnect --type=data

```
## Prod

use pm2 in production

npm install pm2 -g

pm2 start app.js

## Dev

pm2 start app.js --watch