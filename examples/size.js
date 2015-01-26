"use strict";

var simplesmtp = require("../index"),
    fs = require("fs"),
    MailParser = require("mailparser").MailParser,
    mailparser = new MailParser();

// Example for http://tools.ietf.org/search/rfc1870

var maxMessageSize = 10000;

var smtp = simplesmtp.createServer({
    maxSize: maxMessageSize, // maxSize must be set in order to support SIZE
    disableDNSValidation: true,
    debug: true
});
smtp.listen(25);

// setup an event listener when the parsing finishes
mailparser.on("end", function(mail_object){
    console.log("From:", mail_object.from); //[{address:'sender@example.com',name:'Sender Name'}]
    console.log("Subject:", mail_object.subject); // Hello world!
    console.log("Text body:", mail_object.text); // How are you today?
});


smtp.on("startData", function(connection){
    connection.messageSize = 0;
    connection.saveStream = mailparser;
});

smtp.on("data", function(connection, chunk){
    connection.messageSize += chunk.length;
    connection.saveStream.write(chunk);
});

smtp.on("dataReady", function(connection, done){
    connection.saveStream.end();

    // check if message
    if(connection.messageSize > maxMessageSize){
        // mail was too big and therefore ignored
        var err = new Error("Max fileSize reached");
        err.SMTPResponse = "552 message exceeds fixed maximum message size";
        done(err);
    }else{
        done();
        console.log("Delivered message by " + connection.from +
            " to " + connection.to.join(", ") + ", sent from " + connection.host +
            " (" + connection.remoteAddress + ")");
    }
});