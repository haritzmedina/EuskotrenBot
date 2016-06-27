'use strict';
// Botkit
var Botkit = require('botkit');

// Cheerio
var cheerio = require('cheerio');


// jQuery
var jsdom = require('jsdom');
var $ = null;
let promise = new Promise(function(resolve, reject){
  require("jsdom").env("", function(err, window) {
    console.log('executed');
    if (err) {
      console.error(err);
      reject(err);
      return;
    }
    $ = require("jquery")(window);
    resolve({});
  });
});

// Request
var request = require('request');

var controller = Botkit.slackbot();
var bot = controller.spawn({
  // TODO remember not to share this one!
  token: "xoxb-53284146082-buRxEaBiI4PvC6j57hfxmmXi"
});

bot.startRTM(function(err,bot,payload) {
  if (err) {
    throw new Error('Could not connect to Slack');
  }
});

promise.then(function(){
  request.post('http://www.euskotren.eus/es/horarios',{
    form:{
      origen: 'ER',
      destino: 'SS',
      dia: '27',
      mes: '20166',
      hora: '1130',
      form_id: 'horarios_form'
    }
  }, function(error, response, html){
    if(!error){
      var $ = cheerio.load(html);
      console.log($('#horarios-tabla').find('.salida')[1].firstChild.data);
    }
  });
});



controller.hears(["keyword","^pattern$"],["direct_message","direct_mention","mention","ambient"],function(bot,message) {
  // do something to respond to message
  // all of the fields available in a normal Slack message object are available
  // https://api.slack.com/events/message
  bot.reply(message,'You used a keyword!');

});
