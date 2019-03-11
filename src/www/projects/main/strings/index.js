'use strict';

const LANGUAGE = 'sr-cyrl-rs';

// Local strings
const LS = require(`./locales/${LANGUAGE}`);
const langs = require('./languages');

LS.langs = langs;
LS.lang = LANGUAGE;

module.exports = LS;