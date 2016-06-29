A bot to retrieve euskotren timetables in slack.

# Instalation
Rename configuration.properties.template to configuration.properties.
Insert your slack token into configuration.properties file. To create a token: https://api.slack.com/docs/oauth-test-tokens
Remember to add dependencies:

$ npm install

# Run
On Unix

$ nodejs app.js

On Windows

$ nodejs.exe app.js

# Commands
The following messages will be accepted by the chatbot:
* help
* show me next train from <ORIGIN> to <DESTINATION>

The origin and destination should be a train station name as set here:
http://www.euskotren.eus/es/presentacioneuskotren

Example: show me next train from Eibar to Amara
