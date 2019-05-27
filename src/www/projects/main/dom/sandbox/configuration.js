'use strict';

const PL = require('/node/prog-langs/programming-language');
const langsList = require('/node/prog-langs/langs-list');
const LS = require('../../strings');
const Element = require('../element');
const LanguageChoice = require('./lang-choice');

class Configuration extends Element.Region{
  constructor(parent){
    super(parent);

    this.lang = new LanguageChoice(this);
  }

  getLang(){ return this.lang.getLang(); }

  css(){ return 'sandbox-configuration'; }
}

module.exports = Configuration;