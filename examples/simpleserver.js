"use strict";

//console.log(process.stdout.writable);
var simplesmtp = require("../index"),
    fs = require("fs");


var maxMessageSize = 10000;

var smtp = simplesmtp.createServer({
    maxSize: maxMessageSize, // maxSize must be set in order to support SIZE
    disableDNSValidation: true,
    debug: true
});
smtp.listen(25);

smtp.on("startData", function(connection){
    connection.messageSize = 0;
    connection.saveStream = fs.createWriteStream("/tmp/message.txt");
});