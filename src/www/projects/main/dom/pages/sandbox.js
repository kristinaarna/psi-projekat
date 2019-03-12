'use strict';

const LS = require('../../strings');
const Element = require('../element');
const TextEditor = require('../text-editor');
const Form = require('../form');
const Page = require('./page');

class Sandbox extends Page{
  constructor(parent){
    super(parent);

    this.editor = new TextEditor(this);
    this.start = new Form.ButtonConfirm(this, LS.labels.sandbox.buttons.start);

    this.aels();

    this.editor.setVal(LS.texts.scriptTemplate)
    this.editor.focus();
  }

  aels(){
    this.start.on('click', () => {
      log(this.editor.getVal());
    });
  }

  static title(){ return LS.titles.sandbox; }

  css(){ return 'sandbox'; }
};

module.exports = Sandbox;