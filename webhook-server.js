var express = require('express');
var bodyParser = require('body-parser');
var restClient = require('node-rest-client').Client;
const nodemailer = require('nodemailer');

var PORT = (process.env.PORT || 5000);
var SECURITY_TOKEN = 'OJdqYg87SOcax0baFpf5WInifeErRryPA9qLjiugadBgenwi3UDBj8od21UM5to';
var HTTP_AUTH_B64_TOKEN = 'dXNlcjEyMzpwYXNzNzg5'; // user123:pass789
var te_img = 'https://s3.amazonaws.com/uploads.hipchat.com/6634/194641/uncYbgVEMQ1XNtk/TE-Eye-36x36.jpg';
var app = express();
var FROM_ADDRESS = process.env.FROM_NAME  + " <" + process.env.MAIL_RETURN + ">";

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE, // use TLS
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

app.get('/', function (request, response) {
  response.send('This the ThousandEyes simple Webhook server sample.  Use POST methods instead of GET.')
  console.log('GET request received');
})

app.post('/te', function (req, res) {

  let mailOptions = {
    from: FROM_ADDRESS,
    to: process.env.DESTINATION_EMAIL, 
    subject: process.env.SUBJECT + ": " + req.body.alert.testName,
    html: process.env.MAIL_BODY,
  };  

  var client_ip = req.ip
  if (req.headers['authorization'] !== 'Basic ' + HTTP_AUTH_B64_TOKEN) {
    console.log("Unauthorized Access from " + client_ip)
    res.status(401).send({ error: 'Unauthorized for http basic' });
    return;
  }

  switch (req.body.eventType) {

    case "WEBHOOK_TEST":
      console.log(req.body.eventId)
      res.status(200).send(req.body)
      break;
      
    
    case "ALERT_NOTIFICATION_TRIGGER":
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId,
          info.response);
        console.log(FROM_ADDRESS)
      })
      console.log(req.body.alert.testName)
      res.status(200).send(req.body)
      break;

    case "ALERT_NOTIFICATION_CLEAR":
      console.log(req.body.eventId)
      res.status(200).send(req.body)
      break;
      
  }
});

app.use('/webhook-server', router);
app.listen(PORT);
console.log('Webhook Server started... port: ' + PORT);