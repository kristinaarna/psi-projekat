'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');
const readline = require('../readline');
const Server = require('./server');
const HTTPServer = require('./http');
const PHPServer = require('./php');
const ports = require('./ports');

const rl = readline.rl();

O.enhanceRNG();

const servers = {
  http: new HTTPServer(ports.http),
  php: new PHPServer(ports.php),
};

setTimeout(main);

function main(){
  iter(server => {
    server.start();
  });

  aels();
}

function aels(){
  rl.on('line', str => {
    if(str === '') return;

    str = str.split(' ');

    switch(str[0]){
      case 'exit': case 'q':
        exit();
        break;

      default:
        log(`Unknown command ${O.sf(str[0])}`);
        break;
    }
  });
}

function iter(func){
  for(const name in servers)
    func(servers[name]);
}

function exit(){
  rl.close();
  iter(server => server.close());
}