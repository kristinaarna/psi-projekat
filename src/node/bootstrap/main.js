'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');

setTimeout(main);

function main(){
  const args = process.argv.slice(2);
  if(args.length !== 1) err('Expected exactly 1 argument');

  const arg = args[0];
  if(!arg.startsWith('--')) err('Argument must start with "--"');

  switch(arg.slice(2)){
    case 'start': load('node'); break;
    case 'test': load('test'); break;
    default: err(`Invalid argument ${O.sf(arg)}`); break;
  }
}

function load(proj){
  const dir = path.join('..', proj);
  require(dir);
}

function err(msg){
  log(`ERROR: ${msg}`);
  O.proc.exit(1);
}