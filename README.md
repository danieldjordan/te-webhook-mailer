# te-webhook-mailer
Webhook mailer for ThousandEyes

For information This application support the [Getting Started with Node on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs) article - check it out.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed.

```
$ git clone https://github.com/danieldjordan/te-webhook-mailer.git # or clone your own fork
$ cd te-webhook-mailer
$ npm install
$ npm start
```

Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deploying to Heroku

```
$ heroku create
$ git push heroku master
$ heroku open
```

## Variables

Once the application is deployed to Heroku you will need to add Config Variables to the application through your Heroku Dashboard

https://dashboard.heroku.com/apps/

Choose the application and select Settings, under settings you will see a section for Config Variables.
Add the following Config Vars with the appropriate values.

Config Vars | Description
------------ | -------------
DESTINATION_EMAIL | This will be the address the email is sent to
FROM_NAME | The name on of the Sender ie. ThousandEyes
MAIL_BODY | If you want to have content in the body of the email
MAIL_RETURN | This should be a valid return email address
SUBJECT | Email Subject
SMTP_USER | username for SMTP Authentication
SMTP_PASSWORD | password for SMTP Authentication
USE_GMAIL | true if using gmail, if this is true the variables below are not needed
INCLUDE_TEST_BODY | true to include test name in body of email

Config Vars if not using USE_GMAIL | Description
------------ | -------------
SMTP_HOST | Your SMTP host
SMTP_PORT | Port for SMTP server
SMTP_SECURE | true is using secure smtp


You can also use the .env file to make this easier.  To use the .env file you need to install the heroku-config plugin:

```
$ heroku plugins:install heroku-config
```

Edit the .env file in your local repo to include all the correct settings.  Once your instance is running on Heroku, then use the following command to push the config to your application

```
$ heroku config:push
```

This will push the environment variables to your instance.
