'use strict';

const fs = require('fs');
const path = require('path');
const Process = require('./process');

const cwd = __dirname;
const omikronScript = path.join(cwd, '../../frameworks/omikron.js');

const isElectron = 'navigator' in global;

const dirs = {
  omikron: omikronScript,
};

class Window{
  constructor(){
    this.document = new Document();
  }
}

class Document{
  constructor(){}
}

module.exports = getFramework();

function getFramework(){
  if(isElectron){
    const electron = require('electron');
    const ipc = electron.ipcRenderer;

    console.log = (...args) => void ipc.send('log', args);
    console.info = (...args) => void ipc.send('info', args);
    console.error = (...args) => void ipc.send('error', args);
    console.logRaw = data => void ipc.send('logRaw', data);

    let catched = 0;

    process.on('uncaughtException', err => {
      if(catched) return;
      catched = 1;

      if(err === null){
        err = O.ftext(`

          === ERROR ===

          An unexpected error has occured somewhere, but we
          are unable to detect where exactly.
        `);
      }

      log(err);

      setTimeout(() => window.close(), 500);
    });
  }

  var str = fs.readFileSync(omikronScript).toString();
  str = str.split(/\r\n|\r|\n/);
  str[str.length - 1] = 'return O;';
  str = str.join('\n');

  var window = isElectron ? global : new Window();
  var {document} = window;

  var func = new Function('window', 'document', 'require', str);
  var O = func(window, document, getReq());

  O.init(0);

  O.dirs = dirs;
  init(O);

  return O;
}

function init(O){
  O.proc = new Process(O, process);
}

function getReq(){
  if(isElectron) return require;

  return (...args) => {
    if(args.length !== 1)
      throw new TypeError('Expected 1 argument');

    var arg = args[0];
    if(typeof args[0] !== 'string')
      throw new TypeError('Expected a string');

    if(/[\.\/\\]/.test(arg))
      throw new TypeError('Expected a native module name');

    return require(arg);
  };
}