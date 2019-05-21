'use strict';

const Engine = require('../../../../../node/programming-language/engine');
const LS = require('../../strings');
const Element = require('../element');
const TextEditor = require('../text-editor');
const Form = require('../form');
const elemCtors = require('../sandbox');
const Page = require('./page');

class Sandbox extends Page{
  constructor(parent){
    super(parent);

    this.choice = new elemCtors.LanguageChoice(this);
    this.editor = new TextEditor(this);
    this.editor.val = LS.texts.scriptTemplate;
  }

  static title(){ return LS.titles.sandbox; }

  css(){ return 'sandbox'; }
}

module.exports = Sandbox;