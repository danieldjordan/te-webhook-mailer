var express = require('express');
var bodyParser = require('body-parser');
var restClient = require('node-rest-client').Client;
const nodemailer = require('nodemailer');

var PORT = (process.env.PORT || 5000);
var SECURITY_TOKEN = 'OJdqYg87SOcax0baFpf5WInifeErRryPA9qLjiugadBgenwi3UDBj8od21UM5to';
var HTTP_AUTH_B64_TOKEN = 'dXNlcjEyMzpwYXNzNzg5'; // user123:pass789
var TARGET_HOOK = 'https://hooks.slack.com/services/<my_target>';
var te_img = 'https://s3.amazonaws.com/uploads.hipchat.com/6634/194641/uncYbgVEMQ1XNtk/TE-Eye-36x36.jpg';
var app = express();

const DESTINATION_EMAIL = 'danieldjordan@gmail.com'  //Change this to destination address
const RETURN_EMAIL = 'thebigdaddy@gmail.com'       //Change this to a valid return address

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // use TLS
  auth: {
    user: 'thebigdaddy@gmail.com',
    pass: 'cscqnfdpwhxllidm'
  }
});

let mailOptions = {
  from: '"ThousandEyes " <thebigdaddy@gmail.com>', //Sender Address
  to: DESTINATION_EMAIL, //Destination Address
  subject: 'ThousandEyes (Sev4)', //Subject Line
  html: 'Body Text',
};


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

function translateHookContent_slack(req) {
  var retVal = "";
  switch (req.body.eventType) {
    case "ALERT_NOTIFICATION_TRIGGER":
      retVal = "Alert notification [<" + req.body.alert.permalink + "|" + req.body.alert.alertId + ">]: " + req.body.alert.testName + " (" + req.body.alert.ruleName + ")\n";
      switch (req.body.alert.type) {
        case "BGP":
          break;
        case "DNS+ Domain":
          break;
        case "DNS+ Server":
          break;
        default:
          //this has agents
          retVal += " " + req.body.alert.agents.length + " agents: ";
          for (var i = 0; i < req.body.alert.agents.length; i++) {
            if (i > 0) {
              retVal += " | ";
            }
            retVal += "<" + req.body.alert.agents[i].permalink + "|" + req.body.alert.agents[i].agentName + "> ("
            if (req.body.alert.agents[i].active == "1") {
              retVal += "Active";
            } else {
              retVal += "Cleared";
            }
            retVal += "): " + req.body.alert.agents[i].metricsAtEnd;
          }
      }
      break;
    case "ALERT_NOTIFICATION_CLEAR":
      retVal = "Alert cleared [<" + req.body.alert.permalink + "|" + req.body.alert.alertId + "|" + ">]: " + req.body.alert.testName + " (" + req.body.alert.ruleName + ")";
      break;
    case "AGENT_ALERT_NOTIFICATION_TRIGGER":
      retVal = "Agent notification [" + req.body.agentAlert.agentNotificationId + "]: " + req.body.agentAlert.agentName + " (" + req.body.agentAlert.ruleName + ") ";
      retVal += req.body.agentAlert.hostname + " (" + req.body.agentAlert.metricsAtStart + "): "
      if (req.body.agentAlert.active == "1") {
        retVal += "Active";
      } else {
        retVal += "Cleared";
      }
      break;
    case "AGENT_ALERT_NOTIFICATION_CLEAR":
      retVal = "Agent notification cleared [" + req.body.agentAlert.agentNotificationId + "]: " + req.body.agentAlert.agentName + " (" + req.body.agentAlert.ruleName + ") ";
      retVal += req.body.agentAlert.hostname + " (" + req.body.agentAlert.metricsAtEnd + "): "
      if (req.body.agentAlert.active == "1") {
        retVal += "Active";
      } else {
        retVal += "Cleared";
      }
      break;
    case "WEBHOOK_TEST":
      retVal = "Webhook test received. (" + req.body.eventId + ")";
      break;
    default:
      retVal = "Received unregistered event type " + req.body.eventType + " from ThousandEyes webhook.  Body data: \n" + JSON.stringify(req.body);
  }
  return ({ username: "ThousandEyes Alerts", icon_url: te_img, text: retVal });
}

app.get('/', function (request, response) {
  response.send('This the ThousandEyes simple Webhook server sample.  Use POST methods instead of GET.')
  console.log('GET request received');
})

app.post('/test', function (req, res) {


switch (req.body.eventType) {

  case "WEBHOOK_TEST":
    console.log(req.body.eventId)
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId,
      info.response);
    });
    return;
  
  case "ALERT_NOTIFICATION_TRIGGER":
    console.log(req.body.eventId)
    return;

  case "ALERT_NOTIFICATION_CLEAR":
    console.log(req.body.eventId)
    return;

}



});

app.use('/webhook-server', router);
app.listen(PORT);
console.log('Webhook Server started... port: ' + PORT);