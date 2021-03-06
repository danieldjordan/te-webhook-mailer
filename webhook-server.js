
//Set Variables 
var express = require('express');
var bodyParser = require('body-parser');
var restClient = require('node-rest-client').Client;
const nodemailer = require('nodemailer');
var fullMailBody;

//Sets port entered as Heroku Variable
var PORT = (process.env.PORT || 5000);
//Authentication Settings - Base 64 encoded token 
var SECURITY_TOKEN = 'OJdqYg87SOcax0baFpf5WInifeErRryPA9qLjiugadBgenwi3UDBj8od21UM5to';
var HTTP_AUTH_B64_TOKEN = 'dXNlcjEyMzpwYXNzNzg5'; // user123:pass789 Linux Command echo -n "username:password" | base64
//Image for get page
var te_img = 'https://s3.amazonaws.com/uploads.hipchat.com/6634/194641/uncYbgVEMQ1XNtk/TE-Eye-36x36.jpg';
var app = express();

//Build the from address from Heroku variable FROM_NAME and MAIL_RETURN
var FROM_ADDRESS = process.env.FROM_NAME  + " <" + process.env.MAIL_RETURN + ">";
//Default SMTP to Gmail

if (process.env.USE_GMAIL) {
  console.log('Using Gmail Settings');
  var smtpHost = 'smtp.gmail.com';
  var smtpPort = '465';
  var smtpSecure = true;    
} else {
  var smtpHost = process.env.SMTP_HOST;
  var smtpPort = process.env.SMTP_PORT;
  var smtpSecure = process.env.SMTP_SECURE;
};


//Set up Nodemailer
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure, // use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});


var router = express.Router();

function objToStr(obj) {
  var str = '';
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      str += '\"' + p + ': ' + obj[p] + '\"';
    }
  }
  return str;
}


//function to process a get request to the base URL
app.get('/', function (request, response) {
  response.sendFile( __dirname + "/views/" + "config.html" );
  console.log('GET request received');
})


//function to process the te endpoint
app.post('/te', function (req, res) {
  if (process.env.INCLUDE_TEST_BODY) {
      fullMailBody = (process.env.MAIL_BODY + ": " + req.body.alert.testName);
    } else {
      fullMailBody = process.env.MAIL_BODY;
    }
    
  //build the nodemailer options
  let mailOptions = {
    from: FROM_ADDRESS,
    to: process.env.DESTINATION_EMAIL, 
    subject: process.env.SUBJECT + ": " + req.body.alert.testName,
    text: fullMailBody,
  };  

  //check for authentication
  var client_ip = req.ip
  if (req.headers['authorization'] !== 'Basic ' + HTTP_AUTH_B64_TOKEN) {
    console.log("Unauthorized Access from " + client_ip)
    res.status(401).send({ error: 'Unauthorized for http basic' });
    return;
  }

  //switch statement to handle the different TE specific eventTypes
  switch (req.body.eventType) {

    //Webhook test event type
    case "WEBHOOK_TEST":
      console.log(req.body.eventId)
      res.status(200).send(req.body)
      break;
      
    //Alert Notification event type
    case "ALERT_NOTIFICATION_TRIGGER":
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId,
          info.response);
        console.log(FROM_ADDRESS)
      })
      console.log("Alert Recieved for " + req.body.alert.testName)
      res.status(200).send(req.body)
      break;

    //Alert Notification clear event type
    case "ALERT_NOTIFICATION_CLEAR":
      console.log("Alert Notification Cleared for " + req.body.alert.testName)
      res.status(200).send(req.body)
      break;

    //Agent alert Notification event type
    case "AGENT_ALERT_NOTIFICATION_TRIGGER":
      console.log("Agent Alert Recieved")
      res.status(200).send(req.body)
      break;

    //Agent alert Notification clear event type
    case "AGENT_ALERT_NOTIFICATION_CLEAR":
      console.log("Agent Alert Clear Recieved")
      res.status(200).send(req.body)
      break;
  }
});

app.use('/webhook-server', router);
app.listen(PORT);
console.log('Webhook Server started... port: ' + PORT);