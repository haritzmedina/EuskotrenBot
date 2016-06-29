'use strict';

// START REQUIRES

// Botkit
var Botkit = require('botkit');

// Cheerio
var cheerio = require('cheerio');

// Request
var request = require('request');

// Properties file reader
var PropertiesReader = require('properties-reader');

// END REQUIRES

var Onekin = {};
Onekin.Euskotren = {};

Onekin.Euskotren.init = function(){
  // Create slack bot instance
  Onekin.Euskotren.slackbotController = Botkit.slackbot();

// Retrieve slack bot token from properties file
  var properties = PropertiesReader('configuration.properties');

  Onekin.Euskotren.bot = Onekin.Euskotren.slackbotController.spawn({
    token: properties.get('onekin.slack.token')
  });

  Onekin.Euskotren.bot.startRTM(function(err,bot,payload) {
    if (err) {
      throw new Error('Could not connect to Slack');
    }
  });

  // Retrieve stations name and code correspondence

  Onekin.Euskotren.stations = {};

  request('http://www.euskotren.eus/es/horarios', function(error, response, html){
    if(!error){
      let $ = cheerio.load(html);

      $('#edit-destino').find('option').each((id, val) => {
        let stationCode = val.attribs.value;
        if(stationCode){
          let stationName = val.children[0].data;
          Onekin.Euskotren.stations[stationName.toLowerCase()] = stationCode;
        }
      });
    }
  });
};

Onekin.Euskotren.init();

Onekin.Euskotren.slackbotController.hears(["help", "^pattern$"], ["direct_message"], function(bot, message){
  Onekin.Euskotren.bot.reply(message, 'Usage example: "show me next train from Ermua to Amara"');
});

Onekin.Euskotren.slackbotController.hears(["show me next train from (.*) to (.*)","^pattern$"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
  // Retrieve introduced stations
  let originStationName = message.match[1];
  let destinationStationName = message.match[2];

  // TODO Search for code to send query
  let originCode = Onekin.Euskotren.stations[originStationName.toLowerCase()];
  let destinationCode = Onekin.Euskotren.stations[destinationStationName.toLowerCase()];

  Onekin.Euskotren.retrieveDepartures(originCode, destinationCode, new Date(), function(departures){
    Onekin.Euskotren.bot.reply(message,'Next train from '+ originStationName +' to ' +destinationStationName+'' +
        ' will depart at '+departures.toString());
  });
});

Onekin.Euskotren.retrieveDepartures = function(originCode, destinationCode, date, callback){
  // Prepare query to euskotren horarios website
  let queryParams = {};
  queryParams.origen = originCode;
  queryParams.destino = destinationCode;
  queryParams.dia = date.getDate()+"";
  queryParams.mes = date.getFullYear()+""+(date.getMonth()+1);
  queryParams.hora = date.getHours()+""+(parseInt((date.getMinutes() + 7.5)/15) * 15) % 60; // Round to quarters 00,15,30,45
  queryParams.form_id = 'horarios_form';
  console.log(queryParams);

  // Prepare query
  request.post('http://www.euskotren.eus/es/horarios',{
    form: queryParams
  }, function(error, response, html){
    if(!error){
      // Load response DOM
      let $ = cheerio.load(html);

      // TODO Retrieve departures
      let departures = [];
      let resultsTable = $('#horarios-tabla').find('.salida');
      // Check if exists departures
      if(resultsTable){
        departures[0] = resultsTable[1].firstChild.data;
        // Callback with departures
        callback(departures);
      }
      else{
        callback('NoDepartures');
      }
    }
  });
};
