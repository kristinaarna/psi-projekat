'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');
const Server = require('./server');
const HTTPServer = require('./http');
const PHPServer = require('./php');
const ports = require('./ports');

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
  O.proc.once('sigint', () => {
    iter(server => {
      server.close();
    });
  });
}

function iter(func){
  for(const name in servers)
    func(servers[name]);
}