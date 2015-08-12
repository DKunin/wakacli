#!/usr/bin/env node

'use strict';

var request  = require('superagent');
var prettyMs = require('pretty-ms');
var R        = require('ramda');
var nconf    = require('nconf');

nconf.argv()
     .env()
     .file({ file: './config.json' });

var apiKey = nconf.get('apikey');
var config = nconf.get('config');
var help   = nconf.get('help');

if(help) {
  console.log('For configuring your api key - please run wakatime --config apikey=<YOUR_API_KEY>');
  return false;
}

if(config) {
  var data = config.split('=');
  nconf.set(data[0], data[1]);
  nconf.save(function (err) {
    if(err) {
      throw new Error(err);
    }
  });
  console.log('settings updated');
  return;
}

if(!apiKey) {
  throw new Error('You have to set api key before using, please consult wakatime --help');
}

var todaysDate = function(){
  var d = new Date();
  return (d.getMonth()+1)+'/'+d.getDate()+'/'+d.getFullYear();
};

var today = todaysDate();

var summDuration = function(item, itemb){
  return item.total_seconds + itemb.total_seconds;
};

var getFullDuration = R.compose(prettyMs, R.multiply(1000), R.reduce(summDuration, {total_seconds:0}), R.pluck('grand_total'),R.prop('data'));

function getHours(){
  return new Promise(function(resolve,reject){
    request
      .get('https://wakatime.com/api/v1/summary/daily')
      .query({start:today, end: today, api_key: apiKey})
      .end(function (error, body) {
        if(error) {
          reject(error);
          return;
        }
        resolve(getFullDuration(body.body));
    }); 
  });

}

getHours().then(console.log).catch(console.log);