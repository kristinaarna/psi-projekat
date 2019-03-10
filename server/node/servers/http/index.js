'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const O = require('../../omikron');
const Server = require('../server');

const SIMULATE_SLOW_CONNECTION = 0;
const DELAY_RESPONSE = 1e3;

const INDEX_FILE = 'index.htm';

const cwd = __dirname;
const wwwDir = path.join(cwd, '../../../www');

class HTTPServer extends Server{
  constructor(port){
    super(port);

    const onReq = this.onReq.bind(this);
    this.server = http.createServer(onReq);
  }

  static name(){ return 'http'; }

  start(){
    this.server.listen(this.port);
  }

  close(){
    this.server.close();
  }

  onReq(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'x-requested-with');
    
    const send = file => {
      const sendFile = () => fs.createReadStream(file).pipe(res);

      if(!SIMULATE_SLOW_CONNECTION) return sendFile(file);
      setTimeout(sendFile, DELAY_RESPONSE);
    };

    const err = (status, info=null) => {
      if(errHandled) return;

      const hs = req.headers;
      const hName = 'x-requested-with';

      if(O.has(hs, hName) && hs[hName] === 'XMLHttpRequest'){
        res.statusCode = status;
        res.end(info !== null ? info : '');
      }else{
        let redirect = `/?path=error&status=${status}`;
        if(info !== null) redirect += `&info=${info}`;
        
        res.statusCode = 301;
        res.setHeader('Location', redirect);
        res.end();
      }

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
      ) err(400, 'invalidURL');

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
        err(500, 'unknownEntry');
      }
    }catch(e){
      err(500, String(e));
    }

  }
};

module.exports = HTTPServer;