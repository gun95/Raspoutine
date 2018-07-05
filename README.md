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
If you want change look at L.55 in bungie.js\


## Set up

------

```javascript
npm install
npm start
```

Add Raspoutine to you discord server 

If you use kibana do this
(in any channel where Raspoutine can read/write)\
$setmapping
This create mapping in elasticsearch 

If you want use $rank do this\
$createrole 
This create some role in discord server

## Command list

------

All command start with '$'\
You can change it at L.49 in app.js

* createrole\
    * Create a list of role\
* help\
    * Display help command\
* rank <yourb.net>\
    * Sssigns you roles according to number of raid\
* setlog\
    * Do this in the channel where you want see log\
* setmapping\
    * Create mapping for elasticsearch\
* user\
    * Display the number of player connect\