'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const O = require('../omikron');
const statusMsgs = require('./status-msgs');

O.enhanceRNG();

const PORT = 8081;
const INDEX_FILE = 'index.htm';

const cwd = __dirname;
const wwwDir = path.join(cwd, '../../www');

const server = http.createServer(onReq);
server.listen(PORT);

setTimeout(main);

function main(){
  O.proc.on('sigint', () => {
    server.close();
  });
}

function onReq(req, res){
  const send = file => {
    fs.createReadStream(file).pipe(res);
  };

  const err = (status, info=null) => {
    if(errHandled) return;

    let msg = `Status ${status}`;

    if(O.has(statusMsgs, status))
      msg = `${msg} - ${statusMsgs[status]}`;

    res.statusCode = status;

    if(info === null) info = '';
    res.end(`<h1>${msg}</h1>${info}`);
    res.end();

    errHandled = 1;

    throw new Error(info);
  };

  const url = req.url.replace(/[\?\#].*/s, '');

  let errHandled = 0;

  try{
    if(/^\/?(?:omikron|framework)\.js$/.test(url))
      return send(O.dirs.omikron);

    if(
      !/^[a-z0-9\-\.\/]+$/i.test(url) ||
      /^\.|\.$|\.{2}/.test(url)
    ) err(400, 'Invalid URL');

    const check = (en=entry) => {
      if(!fs.existsSync(en))
        err(404);
    };

    let entry = path.join(wwwDir, url);
    check(entry);

    const stat = fs.statSync(entry);

    if(stat.isFile()){
      send(entry);
    }else if(stat.isDirectory()){
      entry = path.join(entry, INDEX_FILE);
      check(entry);
      send(entry);
    }else{
      err(500, 'Unrecognized file system entry type');
    }
  }catch(e){
    err(500, String(e));
  }
}