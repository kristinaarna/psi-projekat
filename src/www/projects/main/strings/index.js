'use strict';

// Local strings

const LANGUAGE = 'sr-cyrl-rs';
const dir = `./locales/${LANGUAGE}`;

const LS = require(`${dir}/main`);
LS.texts = O.obj();

const texts = [
  'help',
];

for(const text of texts){
  const data = require(`${dir}/${text}`);
  LS.texts[text] = data;
}

const langs = require('./languages');
LS.langs = langs;
LS.lang = LANGUAGE;

module.exports = LS;