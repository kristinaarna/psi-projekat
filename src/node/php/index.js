'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const O = require('../omikron');
const config = require('../config');

const cwd = __dirname;
const phpDir = path.join(cwd, '../../php')

module.exports = {
  exec,
};

function exec(file, params=null){
  if(O.ext(file) !== 'php') file += '.php';
  file = path.join(phpDir, file);

  return new Promise((res, rej) => {
    const proc = cp.spawn(config.exe.php, [
      '-d', 'display-errors=On',
      file,
    ], {
      cwd: path.join(file, '..'),
    });

    const outBufs = [];
    const errBufs = [];

    proc.stdout.on('data', buf => outBufs.push(buf));
    proc.stderr.on('data', buf => errBufs.push(buf));

    proc.on('exit', code => {
      const outStr = Buffer.concat(outBufs).toString('utf8').trim();
      const errStr = Buffer.concat(errBufs).toString('utf8').trim();

      if(errStr.length !== 0) return rej(errStr);

      if(code !== 0){
        if(outStr !== 0) return rej(outStr);
        return rej(`PHP NZEC ${code}`);
      }

      if(outStr.length === 0) return res(null);

      let ok = 0;
      let data;

      try{
        data = JSON.parse(outStr);
        ok = 1;
      }catch{}

      if(!ok) return rej(`Invalid JSON: ${O.sf(outStr)}`);
      res(data);
    })

    proc.on('error', rej);

    proc.stdin.end(JSON.stringify(params) + '\n');
  });
}