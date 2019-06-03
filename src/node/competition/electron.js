'use strict';

const fs = require('fs');
const path = require('path');
const O = require('../omikron');
const comp = require('.');

const cwd = __dirname;
const scriptFile = path.join(cwd, '../../www/projects/main/strings/locales/sr-cyrl-rs/script-template.txt');

setTimeout(() => main().catch(log));

async function main(){
  const mainScript = O.rfs(scriptFile, 1);

  const compData = {
    users: [
      {
        nick: 'root',
        points: 0,
        lang: 'Functional()',
        script: mainScript,
      }, {
        nick: 'abc',
        points: 0,
        lang: 'Functional()',
        script: mainScript,
      }
    ],
  };

  await comp.render(compData);

  O.exit();
}