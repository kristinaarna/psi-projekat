'use strict';

const langsList = require('../../../../node/programming-language/langs-list');
const LS = require('../../strings');
const Element = require('../element');
const TextEditor = require('../text-editor');
const Form = require('../form');

const DEFAULT_LANG = 'Functional()';

class LanguageChoice extends Element.InputDropdown{
  constructor(parent){
    super(parent, 'lang');

    const langs = O.sortAsc(O.keys(langsList));

    for(let i = 0; i !== langs.length; i++){
      const name = langs[i];
      const lang = langsList[name];

      this.addOpt(name, name, name === DEFAULT_LANG);
    }
  }

  css(){ return 'lang-choice'; }
}

module.exports = LanguageChoice;