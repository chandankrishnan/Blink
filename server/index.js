'use strict';
let express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    five = require('johnny-five'),
    port = process.env.PORT || 3000;

app.use(express.static('../client'));
app.get('/get', function(req, res) {
    res.send('hello');
});
five.Board().on('ready', function() {
    console.log('ready');

    // Initialize the RGB LED
    let led = new five.Led.RGB({
        pins: {
            red: 6,
            green: 5,
            blue: 3
        }
    });

    led.on();
    led.color({ red: 0, blue: 0, green: 0 });

    let pubnub = require('pubnub').init({
        publish_key: 'pub-c-882bfb3a-d8ba-4332-a76d-dc43f88e15e2',
        subscribe_key: 'sub-c-315f24ac-6533-11e6-9d13-0619f8945a4f'
    });

    let channel = 'node best';

    pubnub.subscribe({
        channel: channel,
        callback: setLedColor,
        connect: initLedColor,
        error: function(err) { console.log(err); }
    });

    function setLedColor(m) {
        led.color({ red: m.r, blue: m.b, green: m.g });
        console.log('color change to...');
        console.log(led.color());
    }

    function initLedColor() {
        pubnub.history({
            channel: channel,
            count: 1,
            callback: function(messages) {
                messages[0].forEach(function(m) {
                    setLedColor(m);
                });
            }
        });
    }
});
app.listen(port, function() {
    console.log('server running on port ' + port);
})
