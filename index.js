#!/usr/bin/env node

'use strict';

var getHours = require('wakatoday');
var nconf    = require('nconf');
var Spinner  = require('cli-spinner').Spinner;
var chalk    = require('chalk');
var homedir  = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;
var wakafile = homedir + '/.wakacli.json';
 
var spinner = new Spinner('getting info.. %s');
spinner.setSpinnerString('|/-\\');

nconf.argv()
     .env()
     .file({ file: wakafile });

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


function logInfo(data){
  spinner.stop(true);
  console.log(chalk.red(data));
}
spinner.start(true);

getHours(apiKey).then(logInfo).catch(logInfo);